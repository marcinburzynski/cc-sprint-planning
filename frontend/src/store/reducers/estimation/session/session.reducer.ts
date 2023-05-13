import { produce } from 'immer';

import type { SessionActionTypes } from '../../../actions/estimation/session';
import type { SessionType } from '../../../../types/commonTypes';

type SessionReducerState = {
    data?: SessionType;
    loading: boolean;
    error: boolean;
}

const SessionReducerDefaultState: SessionReducerState = {
    data: undefined,
    loading: false,
    error: false,
};

export const sessionReducer = (state = SessionReducerDefaultState, action: SessionActionTypes) => produce(state, (draft) => {
    switch (action.type) {
        case 'SET_SESSION':
            draft.data = action.session;
            break;

        case 'GET_SESSION_START':
            draft.loading = true;
            break;

        case 'GET_SESSION_SUCCESS':
            draft.loading = false;
            draft.data = action.session;
            break;

        case 'GET_SESSION_FAILURE':
            draft.loading = false;
            draft.error = true;
            break;

        case 'SESSION_STATE_RESET':
            return SessionReducerDefaultState;

        default:
            return state;
    }
});
