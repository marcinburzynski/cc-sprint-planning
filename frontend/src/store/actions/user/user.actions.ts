import { socket } from '../../../services/socket';
import { TOKEN_LOCAL_STORAGE_KEY } from '../../../constants/localStorageKeys';

import type { UserType } from '../../../types/commonTypes';
import type { TypedThunkAction } from '../../types';
import type { PartialBy } from '../../../types/utilTypes';

export type SetUserAction = {
    type: 'SET_USER';
    user: PartialBy<UserType, 'team'>
}

export const setUser = (user: UserType): SetUserAction => ({
    type: 'SET_USER',
    user,
});

type updateUserStart = {
    type: 'UPDATE_USER_START';
};

type UpdateUserSuccess = {
    type: 'UPDATE_USER_SUCCESS';
    user: UserType;
};

type UpdateUserFailure = {
    type: 'UPDATE_USER_FAILURE';
}

export type UpdateUserAction =
    | updateUserStart
    | UpdateUserSuccess
    | UpdateUserFailure

export const updateUser = (updatedUser: Partial<UserType>): TypedThunkAction<UpdateUserAction> => async (dispatch) => {
    dispatch({ type: 'UPDATE_USER_START' });

    try {
        const res = await socket.updateUser(updatedUser);

        if ('error' in res) {
            return dispatch({ type: 'UPDATE_USER_FAILURE' });
        }

        localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, res.token);

        dispatch({
            type: 'UPDATE_USER_SUCCESS',
            user: res.user,
        });

    } catch (e: unknown) {
        dispatch({ type: 'UPDATE_USER_FAILURE' });
    }
};

export type UserActionTypes =
    | SetUserAction
    | UpdateUserAction
