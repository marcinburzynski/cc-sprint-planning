import { socket } from '../../../../services/socket';
import { http } from '../../../../services/http';

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

type GetTeamsStart = {
    type: 'GET_TEAMS_START';
}

type GetTeamsSuccess = {
    type: 'GET_TEAMS_SUCCESS';
    teams: string[];
}

type GetTeamsFailure = {
    type: 'GET_TEAMS_FAILURE';
    error: unknown;
}

type GetTeamsAction =
    | GetTeamsStart
    | GetTeamsSuccess
    | GetTeamsFailure

export const getTeams = (sessionId: string): TypedThunkAction<GetTeamsAction> => async (dispatch, getState) => {
    const { teams } = getState().estimation.session;
    if (teams.length) return;

    dispatch({ type: 'GET_TEAMS_START' });

    try {
        const { data: { teams } } = await http.getSessionTeams(sessionId);

        dispatch({
            type: 'GET_TEAMS_SUCCESS',
            teams,
        });
    } catch (e: unknown) {
        dispatch({
            type: 'GET_TEAMS_FAILURE',
            error: e,
        });
    }
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
    | GetTeamsAction
    | SessionStateResetAction
