import { socket } from '../../../../services/socket';

import type { TypedThunkAction } from '../../../types';
import type { UserType } from '../../../../types/commonTypes';

type GetSessionUsersStart = {
    type: 'GET_SESSION_USERS';
}

type GetSessionUsersSuccess = {
    type: 'GET_SESSION_USERS_SUCCESS';
    payload: UserType[];
}

type GetSessionUsersFailure = {
    type: 'GET_SESSION_USERS_FAILURE';
}

type GetSessionUsersAction =
    | GetSessionUsersStart
    | GetSessionUsersSuccess
    | GetSessionUsersFailure


export const getSessionUsers = (sessionId: string): TypedThunkAction<GetSessionUsersAction> => async (dispatch) => {
    const { users } = await socket.getSessionUsers(sessionId);

    dispatch({
        type: 'GET_SESSION_USERS_SUCCESS',
        payload: users,
    })
}

type UserJoined = {
    type: 'USER_JOINED';
    user: UserType;
}

export const userJoined = (user: UserType): UserJoined => ({
    type: 'USER_JOINED',
    user,
})


export type SessionUsersActionTypes =
    | GetSessionUsersAction
    | UserJoined
