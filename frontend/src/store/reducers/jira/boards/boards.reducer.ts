import { produce } from 'immer';

import type { JiraBoard } from '../../../../services/jira/jira.types';
import type { BoardsActionTypes } from '../../../actions/jira/boards';

type BoardsReducerState = {
    data: JiraBoard[];
    loading: boolean;
    fetched: boolean;
    error: boolean;
    totalElements?: number;
}

const BOARDS_DEFAULT_STATE: BoardsReducerState = {
    data: [],
    fetched: false,
    loading: false,
    error: false,
    totalElements: undefined,
};


export const boardsReducer = (state = BOARDS_DEFAULT_STATE, action: BoardsActionTypes) => produce(state, (draft) => {
    switch (action.type) {
        case 'GET_BOARDS_START':
            draft.loading = true;
            break;

        case 'GET_BOARDS_SUCCESS':
            if (action.isNextPage) {
                draft.data = [...state.data, ...action.boards];
            } else {
                draft.data = action.boards;
            }

            draft.loading = false;
            draft.fetched = true;
            break;

        case 'GET_BOARDS_FAILURE':
            draft.error = true;
            break;
    }
})
