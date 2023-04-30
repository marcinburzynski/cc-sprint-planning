import axios, { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';

import { http } from '../http';
import {
    JIRA_STATE_LOCAL_STORAGE_KEY,
    JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY,
    JIRA_CLOUD_ID_LOCAL_STORAGE_KEY,
} from '../../constants/localStorageKeys';

import type {
    JiraBoardsRes,
    JiraIssuesRes,
    JiraResource,
} from './jira.types'


class Jira {
    authorized = false

    state?: string
    token?: string
    refreshToken?: string
    oauthToken?: string
    cloudId?: string

    #client?: AxiosInstance

    #refreshTokenTimeout?: number

    #oauthPromise?: Promise<unknown>
    #resolveOAuthPromise?: (value?: PromiseLike<undefined>) => void

    constructor() {
        this.state = localStorage.getItem(JIRA_STATE_LOCAL_STORAGE_KEY) || undefined;
        this.oauthToken = localStorage.getItem(JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.token = localStorage.getItem(JIRA_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.refreshToken = localStorage.getItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY) || undefined;
        this.cloudId = localStorage.getItem(JIRA_CLOUD_ID_LOCAL_STORAGE_KEY) || undefined;

        this.#attachStorageListener();

        if (!(this.token && this.cloudId)) return;

        this.#client = this.#getConfiguredClient(this.token);
        this.authorized = true;

        if (this.#refreshTokenTimeout) return;

        const decodedToken = jwtDecode(this.token) as { exp: number };
        const willExpireIn = (decodedToken.exp * 1000) - Date.now();

        const tokenExpired = Math.sign(willExpireIn) < 1;

        if (tokenExpired) {
            this.authorized = false;
            this.token = undefined;
            this.refreshToken = undefined;
            this.oauthToken = undefined;
            this.cloudId = undefined;
            this.#client = undefined;
            this.state = undefined;

            localStorage.removeItem(JIRA_STATE_LOCAL_STORAGE_KEY);
            localStorage.removeItem(JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(JIRA_TOKEN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(JIRA_CLOUD_ID_LOCAL_STORAGE_KEY);

            if (this.#refreshTokenTimeout) {
                clearTimeout(this.#refreshTokenTimeout);
            }

            return;
        }

        const shouldRefreshNow = Math.sign(willExpireIn - 5000) < 1;

        if (shouldRefreshNow) {
            this.#refreshToken();
        } else {
            this.#refreshTokenTimeout = setTimeout(this.#refreshToken, willExpireIn - 5000);
        }
    }

    #attachStorageListener = () => {
        window.addEventListener('storage', (e) => {
            switch (e.key) {
                case JIRA_STATE_LOCAL_STORAGE_KEY:
                    this.state = e.newValue || this.state;
                    break;

                case JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY:
                    if (e.newValue) {
                        this.oauthToken = e.newValue;

                        if (this.#oauthPromise && this.#resolveOAuthPromise) {
                            this.#resolveOAuthPromise();
                        }
                    }
                    break;
            }
        });
    };

    #getConfiguredClient = (token: string) => {
        return axios.create({
            headers: {
                common: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    }

    auth = (userId: string) => {
        const url = new URL('https://auth.atlassian.com/authorize');

        const params = {
            audience: 'api.atlassian.com',
            client_id: import.meta.env.VITE_ENV_JIRA_CLIENT_ID,
            scope: 'offline_access read:dashboard:jira read:dashboard.property:jira read:issue:jira read:field:jira read:issue-link:jira read:issue-link-type:jira read:issue.property:jira read:priority:jira read:resolution:jira read:issue-details:jira read:issue-type:jira read:issue-status:jira read:issue-type-transition:jira read:issue.transition:jira read:user:jira read:permission:jira read:project:jira read:project-category:jira read:project.component:jira read:project.property:jira read:project-role:jira read:screen:jira read:screen-field:jira read:screen-tab:jira read:user-configuration:jira read:board-scope:jira-software read:avatar:jira read:project.avatar:jira read:issue.remote-link:jira read:issue-field-values:jira read:status:jira',
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
        if (!this.oauthToken) return;

        const { data } = await http.getJiraAuthToken(this.oauthToken);

        this.token = data.access_token;
        this.refreshToken = data.refresh_token;

        this.#client = this.#getConfiguredClient(this.token);

        localStorage.setItem(JIRA_TOKEN_LOCAL_STORAGE_KEY, this.token);
        localStorage.setItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY, this.refreshToken);
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

        this.#refreshTokenTimeout = setTimeout(this.#refreshToken, 3500 * 1000);
    }

    #refreshToken = async () => {
        if (!this.refreshToken) return;

        const { data } = await http.refreshJiraAuthToken(this.refreshToken);

        this.token = data.access_token;
        this.refreshToken = data.refresh_token;

        localStorage.setItem(JIRA_TOKEN_LOCAL_STORAGE_KEY, this.token);
        localStorage.setItem(JIRA_REFRESH_TOKEN_LOCAL_STORAGE_KEY, this.refreshToken);

        this.#refreshTokenTimeout = setTimeout(this.#refreshToken, 3500 * 1000)
    }

    getAllIssuesFromBoard = (board: number, searchText?: string) => {
        const url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/board/${board}/issue`);

        let jql = 'summary IS NOT EMPTY ORDER BY updatedDate';

        const jiraKeyRegex = new RegExp(/^[A-Z]{2,10}-\d{1,9}/);

        if (searchText) {
            jql = `summary ~ "${searchText}"`;

            const isJiraKey = jiraKeyRegex.test(searchText);
            if (isJiraKey) {
                jql = `key = ${searchText}`;
            }

            jql += ' ORDER BY updatedDate';
        }

        url.searchParams.append('jql', jql);

        return this.#client?.get<JiraIssuesRes>(url.toString());
    }

    getAllBoards = () => this.#client?.get<JiraBoardsRes>(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/board?maxResults=100&type=scrum`);

    getImage = async (url: string) => {
        if (!this.#client) return;

        const { data } = await this.#client.get(url, { responseType: 'blob' });
        const reader = new FileReader();
        reader.readAsDataURL(data);

        return new Promise<string>((resolve) => {
            reader.onload = () => {
                resolve(reader.result as string);
            };
        })
    };
}


export const jira = new Jira();
