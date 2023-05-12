import axios, { AxiosInstance } from 'axios';

import { TOKEN_LOCAL_STORAGE_KEY } from '../constants/localStorageKeys';

import type { UserType, SessionType, EstimateCardType } from '../types/commonTypes';
import type { JiraAccessTokenRes } from './jira/jira.types';

class Http {
    #client: AxiosInstance
    token?: string

    constructor() {
        this.#client = axios.create({ baseURL: `${window.location.protocol}//${window.location.hostname}/api` })
        this.token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) || undefined;
    }

    createUser = async (user: Omit<UserType, 'id'>) => {
        const res = await this.#client.post<{ token: string }>('/user/create', user);

        this.token = res.data.token;
        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, this.token);

        return res;
    }

    createSession = (teams: string[], deck: EstimateCardType[]) => {
        return this.#client.post<{ session: SessionType }>('/session/create', { teams, deck });
    }

    getSessionTeams = (sessionId: string) => this.#client.get<{ teams: string[] }>(`/session/${sessionId}/teams`);

    getJiraAuthToken = (oauthToken: string) => this.#client.post<JiraAccessTokenRes>('/jira/get-auth-token', { oauthToken });
    refreshJiraAuthToken = (refreshToken: string) => this.#client.post<JiraAccessTokenRes>('/jira/refresh-token', { refreshToken });
}

export const http = new Http();
