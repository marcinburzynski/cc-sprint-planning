import { produce } from 'immer';

import type { EstimationsActionTypes } from '../../../actions/estimation/estimations';

type EstimationsReducerState = {
    data: {
        [ticketId: string]: {
            [userId: string]: string;
        };
    };
    loading: boolean;
    error: boolean;
}

const EstimationsDefaultState: EstimationsReducerState = {
    data: {},
    loading: false,
    error: false,
}

export const estimationsReducer = (state = EstimationsDefaultState, action: EstimationsActionTypes) => produce(state, (draft) => {
    switch (action.type) {
        case 'GET_SESSION_ESTIMATIONS_START':
            draft.loading = true;
            break;

        case 'GET_SESSION_ESTIMATIONS_SUCCESS':
            return {
                ...EstimationsDefaultState,
                data: action.payload.reduce((acc, curr) => {
                    acc[curr.ticketId] = {
                        ...(acc[curr.ticketId] || {}),
                        [curr.userId]: curr.value,
                    }

                    return acc
                }, {} as EstimationsReducerState['data'])
            }

        case 'GET_SESSION_ESTIMATIONS_FAILURE':
            draft.loading = false;
            draft.error = true;
            break;

        case 'SEND_ESTIMATION':
        case 'RECEIVE_ESTIMATION':
            draft.data[action.estimation.ticketId] = {
                ...(state.data[action.estimation.ticketId] || {}),
                [action.estimation.userId]: action.estimation.value,
            }
            break;

        default:
            return state
    }
})
