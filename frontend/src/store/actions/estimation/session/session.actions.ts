import { socket } from '../../../../services/socket';

import type { TypedThunkAction } from '../../../types';
import type { SessionType } from '../../../../types/commonTypes';

type SetSessionAction = {
    type: 'SET_SESSION';
    session: SessionType;
};

export const setSession = (session: SessionType): SetSessionAction => ({
    type: 'SET_SESSION',
    session,
});


type GetSessionStart = {
    type: 'GET_SESSION_START';
};

type GetSessionSuccess = {
    type: 'GET_SESSION_SUCCESS';
    session: SessionType;
};

type GetSessionFailure = {
    type: 'GET_SESSION_FAILURE';
};

type GetSessionAction =
    | GetSessionStart
    | GetSessionSuccess
    | GetSessionFailure

export const getSession = (sessionId: string): TypedThunkAction<GetSessionAction> => async (dispatch, getState) => {
    const storedSession = getState().estimation.session;

    if (storedSession.data) return;

    dispatch({ type: 'GET_SESSION_START' });

    const { session } = await socket.getSession(sessionId);

    dispatch({
        type: 'GET_SESSION_SUCCESS',
        session,
    })
}

type SessionStateResetAction = {
    type: 'SESSION_STATE_RESET';
};

export const sessionStateReset = (): SessionStateResetAction => ({
    type: 'SESSION_STATE_RESET',
})


export type SessionActionTypes =
    | SetSessionAction
    | GetSessionAction
    | SessionStateResetAction
