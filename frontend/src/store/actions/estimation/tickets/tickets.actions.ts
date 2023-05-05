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

export const createTicket = (newTicket: Omit<TicketType, 'id' | 'order'>): TypedThunkAction<CreateTicketAction> => async (dispatch, getState) => {
    const state = getState()

    const partialTicket: Omit<TicketType, 'id'> = {
        name: newTicket.name,
        issueKey: newTicket.issueKey,
        order: Object.values(state.estimation.tickets.data).length + 1,
        isRevealed: false,
    }

    const { ticket } = await socket.createTicket(partialTicket)

    dispatch({
        type: 'CREATE_TICKET',
        ticket,
    })
}

type CreateMultipleTicketsAction = {
    type: 'CREATE_MULTIPLE_TICKETS';
    tickets: TicketType[];
}

export const createMultipleTickets = (newTickets: Omit<TicketType, 'id' | 'order'>[]): TypedThunkAction<CreateMultipleTicketsAction> => async (dispatch, getState) => {
    const state = getState();

    const partialTickets: Omit<TicketType, 'id'>[] = newTickets.map((ticket, index) => ({
        name: ticket.name,
        issueKey: ticket.issueKey,
        order: Object.values(state.estimation.tickets.data).length + index + 1,
        isRevealed: false,
    }));

    const { tickets } = await socket.createMultipleTickets(partialTickets);

    dispatch({
        type: 'CREATE_MULTIPLE_TICKETS',
        tickets,
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

type ReceiveMultipleTicketsAction = {
    type: 'RECEIVE_MULTIPLE_TICKETS';
    tickets: TicketType[];
}

export const receiveMultipleTickets = (tickets: TicketType[]): ReceiveMultipleTicketsAction => ({
    type: 'RECEIVE_MULTIPLE_TICKETS',
    tickets,
})

type RevealTicketEstimateAction = {
    type: 'REVEAL_TICKET_ESTIMATE';
    ticketId: string;
}

export const revealTicketEstimate = (ticketId: string): TypedThunkAction<RevealTicketEstimateAction> => async (dispatch) => {
    await socket.revealTicketEstimate(ticketId);

    dispatch({
        type: 'REVEAL_TICKET_ESTIMATE',
        ticketId,
    })
}

type RemoveTicketAction = {
    type: 'REMOVE_TICKET';
    ticketId: string;
}

export const removeTicket = (ticketId: string): TypedThunkAction<RemoveTicketAction> => async (dispatch) => {
    await socket.removeTicket(ticketId);

    dispatch({
        type: 'REMOVE_TICKET',
        ticketId,
    })
}

type ReceiveRemoveTicketAction = {
    type: 'RECEIVE_REMOVE_TICKET';
    ticketId: string;
}

export const receiveRemoveTicket = (ticketId: string): ReceiveRemoveTicketAction => ({
    type: 'RECEIVE_REMOVE_TICKET',
    ticketId,
})

type RestartTicketEstimationAction = {
    type: 'RESTART_TICKET_ESTIMATION';
    ticketId: string;
};

export const restartTicketEstimation = (ticketId: string): TypedThunkAction<RestartTicketEstimationAction> => async (dispatch) => {
    await socket.restartTicketEstimation(ticketId)

    dispatch({
        type: 'RESTART_TICKET_ESTIMATION',
        ticketId,
    });
}

export type TicketsActionTypes =
    | GetSessionTicketsAction
    | CreateTicketAction
    | CreateMultipleTicketsAction
    | ReceiveTicketAction
    | ReceiveMultipleTicketsAction
    | RevealTicketEstimateAction
    | RemoveTicketAction
    | ReceiveRemoveTicketAction
    | RestartTicketEstimationAction
