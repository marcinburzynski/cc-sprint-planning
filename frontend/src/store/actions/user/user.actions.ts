import { USER_LOCAL_STORAGE_KEY } from '../../../constants/localStorageKeys';

import type { TypedThunkAction } from '../../types';
import type { UserType } from '../../../types/commonTypes';
import type { PartialBy } from '../../../types/utilTypes';

export type SetUserAction = {
    type: 'SET_USER';
    user: PartialBy<UserType, 'team'>
}

export const setUser = (user: UserType): TypedThunkAction<SetUserAction> => (dispatch, getState) => {
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user))

    dispatch({
        type: 'SET_USER',
        user,
    })
}

export type UserActionTypes =
    | SetUserAction
