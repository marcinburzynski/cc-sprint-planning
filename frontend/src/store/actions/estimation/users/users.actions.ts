import { isEmpty, omit } from 'lodash';

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


export const getSessionUsers = (): TypedThunkAction<GetSessionUsersAction> => async (dispatch, getState) => {
    const userId = getState().user.id;
    const usersStore = getState().estimation.users;

    if (usersStore.loading || usersStore.isEmpty || !userId || !isEmpty(omit(usersStore.data, userId))) return;

    const { users } = await socket.getSessionUsers();

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

type UsersStateResetAction = {
    type: 'USERS_STATE_RESET';
};

export const usersStateReset = (): UsersStateResetAction => ({
    type: 'USERS_STATE_RESET',
})


export type SessionUsersActionTypes =
    | GetSessionUsersAction
    | UserJoined
    | UsersStateResetAction
