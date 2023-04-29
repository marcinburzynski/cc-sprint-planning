import axios, { AxiosInstance } from 'axios';

import { TOKEN_LOCAL_STORAGE_KEY } from '../constants/localStorageKeys';

import type { UserType } from '../types/commonTypes';

class Http {
    #client: AxiosInstance
    token?: string

    constructor() {
        this.#client = axios.create({ baseURL: `${window.location.protocol}//${window.location.hostname}` })
        this.token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) || undefined;
    }

    createUser = async (user: Omit<UserType, 'id'>) => {
        const res = await this.#client.post<{ token: string }>('/user/create', user);

        this.token = res.data.token;
        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, this.token);

        return res;
    }

    createSession = (teams: string[]) => this.#client.post<{ sessionId: string }>('/session/create', { teams });
    getSessionTeams = (sessionId: string) => this.#client.get<{ teams: string[] }>(`/session/${sessionId}/teams`);
}

export const http = new Http();
