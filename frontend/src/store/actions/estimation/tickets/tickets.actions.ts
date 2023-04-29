import { socket } from '../../../../services/socket';

import type { TypedThunkAction } from '../../../types';
import type { TicketType } from '../../../../types/commonTypes';

type GetSessionTicketsStart = {
    type: 'GET_SESSION_TICKETS_START';
}

type GetSessionTicketsSuccess = {
    type: 'GET_SESSION_TICKETS_SUCCESS';
    payload: TicketType[];
}

type GetSessionTicketsFailure = {
    type: 'GET_SESSION_TICKETS_FAILURE';
}

type GetSessionTicketsAction =
    | GetSessionTicketsStart
    | GetSessionTicketsSuccess
    | GetSessionTicketsFailure


export const getSessionTickets = (): TypedThunkAction<GetSessionTicketsAction> => async (dispatch) => {
    const { tickets } = await socket.getSessionTickets();

    dispatch({
        type: 'GET_SESSION_TICKETS_SUCCESS',
        payload: tickets,
    })
}


type CreateTicketAction = {
    type: 'CREATE_TICKET';
    ticket: TicketType;
}

export const createTicket = (name: string): TypedThunkAction<CreateTicketAction> => async (dispatch, getState) => {
    const state = getState()

    const partialTicket: Omit<TicketType, 'id'> = {
        name,
        order: Object.values(state.estimation.tickets.data).length + 1,
        isRevealed: false,
    }

    const { ticket } = await socket.createTicket(partialTicket)

    dispatch({
        type: 'CREATE_TICKET',
        ticket,
    })
}

type ReceiveTicketAction = {
    type: 'RECEIVE_TICKET';
    ticket: TicketType;
}

export const receiveTicket = (ticket: TicketType): ReceiveTicketAction => ({
    type: 'RECEIVE_TICKET',
    ticket,
})

type RevealTicketEstimate = {
    type: 'REVEAL_TICKET_ESTIMATE';
    ticketId: string;
}

export const revealTicketEstimate = (ticketId: string): TypedThunkAction<RevealTicketEstimate> => async (dispatch) => {
    await socket.revealTicketEstimate(ticketId);

    dispatch({
        type: 'REVEAL_TICKET_ESTIMATE',
        ticketId,
    })
}

export type TicketsActionTypes =
    | GetSessionTicketsAction
    | CreateTicketAction
    | ReceiveTicketAction
    | RevealTicketEstimate
