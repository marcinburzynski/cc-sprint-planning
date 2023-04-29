import { socket } from '../../../../services/socket';

import type { TypedThunkAction } from '../../../types';
import type { EstimationType } from '../../../../types/commonTypes';

type GetSessionEstimationsStart = {
    type: 'GET_SESSION_ESTIMATIONS_START';
}

type GetSessionEstimationsSuccess = {
    type: 'GET_SESSION_ESTIMATIONS_SUCCESS';
    payload: EstimationType[];
}

type GetSessionEstimationsFailure = {
    type: 'GET_SESSION_ESTIMATIONS_FAILURE';
}

type GetSessionEstimationsAction =
    | GetSessionEstimationsStart
    | GetSessionEstimationsSuccess
    | GetSessionEstimationsFailure


export const getSessionEstimations = (): TypedThunkAction<GetSessionEstimationsAction> => async (dispatch) => {
    dispatch({
        type: 'GET_SESSION_ESTIMATIONS_START',
    })

    const { estimates } = await socket.getSessionEstimates();

    dispatch({
        type: 'GET_SESSION_ESTIMATIONS_SUCCESS',
        payload: estimates,
    })
}

type SendEstimationAction = {
    type: 'SEND_ESTIMATION';
    estimation: EstimationType;
}

export const sendEstimation = (
    ticketId: string,
    estimationValue: string | null,
): TypedThunkAction<SendEstimationAction> => async (dispatch, getState) => {
    const { id } = getState().user;
    if (!id) return;

    const estimation: SendEstimationAction['estimation'] = {
        value: estimationValue,
        userId: id,
        ticketId,
    }

    await socket.sendEstimation(estimation);

    dispatch({
        type: 'SEND_ESTIMATION',
        userId: id,
        estimation,
    })
}

type ReceiveEstimationAction = {
    type: 'RECEIVE_ESTIMATION';
    estimation: EstimationType;
}

export const receiveEstimation = (estimation: EstimationType): ReceiveEstimationAction => ({
    type: 'RECEIVE_ESTIMATION',
    estimation,
});


export type EstimationsActionTypes =
    | GetSessionEstimationsAction
    | SendEstimationAction
    | ReceiveEstimationAction
