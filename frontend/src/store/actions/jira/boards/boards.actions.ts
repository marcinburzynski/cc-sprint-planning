import { jira } from '../../../../services/jira';

import type { TypedThunkAction } from '../../../types';
import type { JiraBoard } from '../../../../services/jira/jira.types';

type GetBoardsStart = {
    type: 'GET_BOARDS_START';
}

type GetBoardsSuccess = {
    type: 'GET_BOARDS_SUCCESS';
    boards: JiraBoard[];
    totalBoards: number;
    isNextPage: boolean;
}

type GetBoardsFailure = {
    type: 'GET_BOARDS_FAILURE';
}

type GetBoardsAction =
    | GetBoardsStart
    | GetBoardsSuccess
    | GetBoardsFailure

export const getBoards = (nextPage?: boolean): TypedThunkAction<GetBoardsAction> => async (dispatch, getState) => {
    const storedBoards = getState().jira.boards;

    dispatch({ type: 'GET_BOARDS_START' });

    const boards = await jira.getAllBoards(nextPage ? storedBoards.data.length : undefined)

    if (!boards) {
        return dispatch({ type: 'GET_BOARDS_FAILURE' });
    }

    dispatch({
        type: 'GET_BOARDS_SUCCESS',
        boards: boards.data.values,
        totalBoards: boards.data.total,
        isNextPage: !!nextPage,
    })
}


type SelectJiraBoardAction = {
    type: 'SELECT_JIRA_BOARD';
    boardId: number | null;
}

export const selectJiraBoard = (boardId: number | null): SelectJiraBoardAction => ({
    type: 'SELECT_JIRA_BOARD',
    boardId,
})


export type BoardsActionTypes =
    | GetBoardsAction
    | SelectJiraBoardAction
