import { nanoid } from 'nanoid';

import { http } from "../http";
import {
    GOOGLE_OAUTH_CODE,
    GOOGLE_OAUTH_STATE,
    TOKEN_LOCAL_STORAGE_KEY,
} from '../../constants/localStorageKeys';

const googleAuthScopes = [
    'email',
    'profile',
]

class Google {
    #code?: string;
    #state?: string;

    #resolveOAuthPromise?: (value?: PromiseLike<undefined>) => void;

    #oauthPromise?: Promise<unknown>;

    constructor() {
        this.#attachStorageListener();
    }

    auth = (sessionId?: string) => {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        const state = nanoid();
        const params = {
            'response_type': 'code',
            'client_id': import.meta.env.VITE_ENV_GOOGLE_CLIENT_ID,
            'redirect_uri': `${window.location.origin}/google-oauth`,
            'scope': googleAuthScopes.join(' '),
            'state': state,
        };

        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        window.open(url.toString(), '_blank', 'height=932,width=735,popup=1');
        this.#oauthPromise = new Promise((resolve) => {
            this.#resolveOAuthPromise = resolve;
        }).then(() => this.#finalizeAuth(sessionId));

        return this.#oauthPromise as Promise<string>;
    }

    #finalizeAuth = async (sessionId?: string): Promise<string> => {
        if (!this.#code) return this.auth()

        const { data } = await http.getGoogleUser(this.#code)

        http.init(data.token);
        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, data.token);

        return data.token
    }

    #attachStorageListener = () => {
        window.addEventListener('storage', (e) => {
            switch (e.key) {
                case GOOGLE_OAUTH_STATE:
                    this.#state = e.newValue || this.#state;
                    break;

                case GOOGLE_OAUTH_CODE:
                    if (e.newValue) {
                        this.#code = e.newValue;

                        if (this.#oauthPromise && this.#resolveOAuthPromise) {
                            this.#resolveOAuthPromise();
                        }
                    }
                    break;
            }
        });
    };
}

export const google = new Google();