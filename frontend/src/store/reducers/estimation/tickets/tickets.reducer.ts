import { produce } from 'immer';
import { omit } from 'lodash';

import { TicketsActionTypes } from '../../../actions/estimation/tickets';

import type { TicketType } from '../../../../types/commonTypes';

type TicketsReducerState = {
    data: Record<string, TicketType>;
    loading: boolean;
    isEmpty: boolean;
    error: boolean;
}

const TicketsDefaultState: TicketsReducerState = {
    data: {},
    loading: false,
    isEmpty: false,
    error: false,
}

export const ticketsReducer = (state = TicketsDefaultState, action: TicketsActionTypes) => produce(state, (draft) => {
    switch (action.type) {
        case 'GET_SESSION_TICKETS_START':
            draft.loading = true;
            break;

        case 'GET_SESSION_TICKETS_SUCCESS':
            return {
                ...TicketsDefaultState,
                data: action.payload.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}),
                isEmpty: !action.payload.length,
            }

        case 'GET_SESSION_TICKETS_FAILURE':
            draft.error = true;
            break;

        case 'CREATE_TICKET':
        case 'RECEIVE_TICKET':
            draft.data[action.ticket.id] = action.ticket;
            draft.isEmpty = false;
            break;

        case 'CREATE_MULTIPLE_TICKETS':
        case 'RECEIVE_MULTIPLE_TICKETS':
            return {
                ...state,
                isEmpty: false,
                data: {
                    ...state.data,
                    ...action.tickets.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}),
                },
            }

        case 'REVEAL_TICKET_ESTIMATE':
            draft.data[action.ticketId].isRevealed = true;
            break;

        case 'REMOVE_TICKET':
        case 'RECEIVE_REMOVE_TICKET':
            draft.data = omit(state.data, action.ticketId);
            break;

        default:
            return state
    }
})
