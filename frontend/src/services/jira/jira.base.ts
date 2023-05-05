import axios, { AxiosInstance, AxiosError } from 'axios';
import jwtDecode from 'jwt-decode';

import { http } from '../http';
import {
    TOKEN_LOCAL_STORAGE_KEY,
    JIRA_STATE_LOCAL_STORAGE_KEY,
    JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_CLOUD_ID_LOCAL_STORAGE_KEY,
} from '../../constants/localStorageKeys';
import { JIRA_API_PERMS } from './jira.constants';

import type { UserType } from '../../types/commonTypes';
import type { JiraResource } from './jira.types'

export class JiraBase {
    authorized = false

    #state?: string
    #token?: string
    #refreshToken?: string
    #oauthToken?: string
    cloudId?: string

    #client?: AxiosInstance

    #refreshTokenTimeout?: number

    #oauthPromise?: Promise<unknown>
    #resolveOAuthPromise?: (value?: PromiseLike<undefined>) => void

    constructor() {
        this.#state = localStorage.getItem(JIRA_STATE_LOCAL_STORAGE_KEY) || undefined;
        this.#oauthToken = localStorage.getItem(JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.#token = localStorage.getItem(JIRA_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.#refreshToken = localStorage.getItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.cloudId = localStorage.getItem(JIRA_CLOUD_ID_LOCAL_STORAGE_KEY) || undefined;

        this.#attachStorageListener();

        if (!(this.#token && this.cloudId)) return;

        this.#client = this.#getConfiguredClient(this.#token);
        this.authorized = true;

        if (this.#refreshTokenTimeout) return;

        const decodedToken = jwtDecode(this.#token) as { exp: number };
        const willExpireIn = (decodedToken.exp * 1000) - Date.now();

        const tokenExpired = Math.sign(willExpireIn) < 1;

        if (tokenExpired) {
            this.#disconnectClient();
            return this;
        }

        const shouldRefreshNow = Math.sign(willExpireIn - 5000) < 1;

        if (shouldRefreshNow) {
            this.#handleRefreshToken();
        } else {
            this.#refreshTokenTimeout = setTimeout(this.#handleRefreshToken, willExpireIn * 0.75);
        }
    }

    #attachStorageListener = () => {
        window.addEventListener('storage', (e) => {
            switch (e.key) {
                case JIRA_STATE_LOCAL_STORAGE_KEY:
                    this.#state = e.newValue || this.#state;
                    break;

                case JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY:
                    if (e.newValue) {
                        this.#oauthToken = e.newValue;

                        if (this.#oauthPromise && this.#resolveOAuthPromise) {
                            this.#resolveOAuthPromise();
                        }
                    }
                    break;
            }
        });
    };

    #disconnectClient = () => {
        this.authorized = false;
        this.#token = undefined;
        this.#refreshToken = undefined;
        this.#oauthToken = undefined;
        this.cloudId = undefined;
        this.#client = undefined;
        this.#state = undefined;

        localStorage.removeItem(JIRA_STATE_LOCAL_STORAGE_KEY);
        localStorage.removeItem(JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY);
        localStorage.removeItem(JIRA_TOKEN_LOCAL_STORAGE_KEY);
        localStorage.removeItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY);
        localStorage.removeItem(JIRA_CLOUD_ID_LOCAL_STORAGE_KEY);

        if (this.#refreshTokenTimeout) {
            clearTimeout(this.#refreshTokenTimeout);
        }
    };

    #axiosResponseInterceptorOnRejected = (error: unknown) => {
        if (!(error instanceof AxiosError)) return Promise.reject(error)

        if (error?.code === '401') {
            this.#disconnectClient();

            const userToken = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) as string;
            const decodedUser = jwtDecode<UserType>(userToken);

            this.auth(decodedUser.id);
        }

        return Promise.reject(error);
    }

    #getConfiguredClient = (token: string) => {
        const client = axios.create({
            headers: {
                common: {
                    Authorization: `Bearer ${token}`,
                },
            }
        });

        client.interceptors.response.use((req) => req, this.#axiosResponseInterceptorOnRejected)

        return client;
    }

    auth = (userId: string) => {
        const url = new URL('https://auth.atlassian.com/authorize');

        const params = {
            audience: 'api.atlassian.com',
            client_id: import.meta.env.VITE_ENV_JIRA_CLIENT_ID,
            scope: JIRA_API_PERMS.join(' '),
            redirect_uri: `${window.location.origin}/oauth`,
            state: userId,
            response_type: 'code',
            prompt: 'consent',
        };

        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        window.open(url.toString(), '_blank', 'height=932,width=735,popup=1');

        this.#oauthPromise = new Promise((resolve) => {
            this.#resolveOAuthPromise = resolve;
        }).then(() => this.#finalizeAuth())

        return this.#oauthPromise
    };

    #getAccessToken = async () => {
        if (!this.#oauthToken) return;

        const { data } = await http.getJiraAuthToken(this.#oauthToken);

        this.#token = data.access_token;
        this.#refreshToken = data.refresh_token;

        this.#client = this.#getConfiguredClient(this.#token);

        localStorage.setItem(JIRA_TOKEN_LOCAL_STORAGE_KEY, this.#token);
        localStorage.setItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY, this.#refreshToken);
    }

    #getCloudId = async () => {
        if (!this.#client) return;

        const { data: [firstApp] } = await this.#client.get<JiraResource[]>('https://api.atlassian.com/oauth/token/accessible-resources');

        this.cloudId = firstApp.id;
        localStorage.setItem(JIRA_CLOUD_ID_LOCAL_STORAGE_KEY, this.cloudId);
    }

    #finalizeAuth = async () => {
        await this.#getAccessToken();
        await this.#getCloudId();
        this.authorized = true;

        this.#refreshTokenTimeout = setTimeout(this.#handleRefreshToken, 3500 * 1000);
    }

    #handleRefreshToken = async () => {
        if (!this.#refreshToken) return;

        const { data } = await http.refreshJiraAuthToken(this.#refreshToken);

        this.#token = data.access_token;
        this.#refreshToken = data.refresh_token;

        localStorage.setItem(JIRA_TOKEN_LOCAL_STORAGE_KEY, this.#token);
        localStorage.setItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY, this.#refreshToken);

        this.#refreshTokenTimeout = setTimeout(this.#handleRefreshToken, 3500 * 1000)
    }

    getAuthedClient = async () => {
        if (!this.authorized) {
            const userToken = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) as string;
            const decodedUser = jwtDecode<UserType>(userToken);

            await this.auth(decodedUser.id);
        }

        return this.#client as AxiosInstance;
    }
}
