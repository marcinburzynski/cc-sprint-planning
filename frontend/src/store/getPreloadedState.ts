import jwtDecode from 'jwt-decode';

import { TOKEN_LOCAL_STORAGE_KEY } from '../constants/localStorageKeys';

import type { RootReducerState } from './reducers/rootReducer';
import type { UserType } from '../types/commonTypes';

export const getPreloadedState = (): Partial<RootReducerState> => {
    const persistedToken = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY);
    const decodedUser = persistedToken
        ? jwtDecode(persistedToken) as UserType
        : undefined

    return {
        user: decodedUser,
    }
}
