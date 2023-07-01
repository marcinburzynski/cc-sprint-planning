import axios, { AxiosInstance } from 'axios';

import { TOKEN_LOCAL_STORAGE_KEY } from '../constants/localStorageKeys';

import type { UserType, SessionType, EstimateCardType } from '../types/commonTypes';
import type { JiraAccessTokenRes } from './jira/jira.types';

class Http {
    #client = axios.create();
    token?: string

    constructor() {
        this.init();
    }

    init = (newToken: string | null = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)) => {
        this.token = newToken || undefined;

        this.#client = axios.create({
            baseURL: `${window.location.protocol}//${window.location.hostname}/api`,
            headers: {
                common: { authorization: this.token },
            },
        });
    }

    createUser = async (user: Omit<UserType, 'id'>) => {
        const res = await this.#client.post<{ token: string }>('/user/create', user);

        this.token = res.data.token;
        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, this.token);

        return res;
    }

    updateYourUser = async (user: Partial<UserType>) => {
        type UserUpdateRes = {
            user: UserType;
            token: string;
        }

        const res = await this.#client.post<UserUpdateRes>('/user/update-self', user);

        this.token = res.data.token;
        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, this.token);

        return res;
    }

    getGoogleUser = async (code: string, sessionId?: string) => this.#client.post<{ token: string }>(
        '/google/auth',
        { code, sessionId },
    );

    createSession = (teams: string[], deck: EstimateCardType[]) => {
        return this.#client.post<{ session: SessionType }>('/session/create', { teams, deck });
    }

    getSessionTeams = (sessionId: string) => this.#client.get<{ teams: string[] }>(`/session/${sessionId}/teams`);

    getJiraAuthToken = (oauthToken: string) => this.#client.post<JiraAccessTokenRes>('/jira/get-auth-token', { oauthToken });
    refreshJiraAuthToken = (refreshToken: string) => this.#client.post<JiraAccessTokenRes>('/jira/refresh-token', { refreshToken });
}

export const http = new Http();
