import { USER_LOCAL_STORAGE_KEY } from '../constants/localStorageKeys';

import type { RootReducerState } from './reducers/rootReducer';
import type { UserType } from '../types/commonTypes';

export const getPreloadedState = (): Partial<RootReducerState> => {
    const persistedUserStrJSON = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    const persistedUser = persistedUserStrJSON
        ? JSON.parse(persistedUserStrJSON) as UserType
        : undefined;

    return {
        user: persistedUser,
    }
}
