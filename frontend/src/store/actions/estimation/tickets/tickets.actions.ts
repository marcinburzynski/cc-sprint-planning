import { isEmpty } from 'lodash';

import { socket } from '../../../../services/socket';
import { setNotification, type SetNotificationAction } from '../../notifications';

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


export const getSessionTickets = (): TypedThunkAction<GetSessionTicketsAction> => async (dispatch, getState) => {
    const ticketsStore = getState().estimation.tickets;

    if (ticketsStore.loading || ticketsStore.error || !isEmpty(ticketsStore.data)) return;

    dispatch({ type: 'GET_SESSION_TICKETS_START' });

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
        issueUrl: ticket.issueUrl,
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

type SetSelectedTicketAction = {
    type: 'SET_SELECTED_TICKET';
    ticketId: string;
}

export const setSelectedTicket = (ticketId: string): SetSelectedTicketAction => ({
    type: 'SET_SELECTED_TICKET',
    ticketId,
});

type SetSelectedTicketForEveryoneAction = {
    type: 'SET_SELECTED_TICKET_FOR_EVERYONE';
    ticketId: string;
};

export const setSelectedTicketForEveryone = (ticketId: string): TypedThunkAction<SetSelectedTicketForEveryoneAction> => async (dispatch) => {
    await socket.setSelectedTicketForEveryone(ticketId);

    dispatch({
        type: 'SET_SELECTED_TICKET_FOR_EVERYONE',
        ticketId,
    })
};

type ReceiveSelectedTicketAction = {
    type: 'RECEIVE_SELECTED_TICKET';
    ticketId: string;
};

export const receiveSelectedTicket = (ticketId: string): ReceiveSelectedTicketAction => ({
    type: 'RECEIVE_SELECTED_TICKET',
    ticketId,
});

type SetTicketsOrderStart = {
    type: 'SET_TICKETS_ORDER_START';
    orderedTicketIds: string[];
};

type SetTicketsOrderSuccess = {
    type: 'SET_TICKETS_ORDER_SUCCESS';
}

type SetTicketsOrderFailure = {
    type: 'SET_TICKETS_ORDER_FAILURE';
    orderedTicketIds: string[];
}

type SetTicketsOrderAction =
    | SetTicketsOrderStart
    | SetTicketsOrderSuccess
    | SetTicketsOrderFailure

export const setTicketsOrder = (orderedTicketIds: string[]): TypedThunkAction<SetTicketsOrderAction | SetNotificationAction> => {
    return async (dispatch, getState) => {
        const tickets = getState().estimation.tickets.data
        const prevOrderedTicketIds = Object.values(tickets)
            .sort((a, b) => a.order - b.order)
            .map(({ id }) => id)

        dispatch({
            type: 'SET_TICKETS_ORDER_START',
            orderedTicketIds,
        });

        const res = await socket.setTicketsOrder(orderedTicketIds);

        if (!res.ok) {
            dispatch(setNotification('Failed to change tickets order.', {
                notificationType: 'error',
                description: 'Unexpected error occurred. Please try reordering tickets once again.',
            }));

            return dispatch({
                type: 'SET_TICKETS_ORDER_FAILURE',
                orderedTicketIds: prevOrderedTicketIds,
            });
        }

        dispatch({ type: 'SET_TICKETS_ORDER_SUCCESS' });
    }
}

type ReceiveTicketsOrderAction = {
    type: 'RECEIVE_TICKETS_ORDER';
    orderedTicketIds: string[];
};

export const receiveTicketsOrder = (orderedTicketIds: string[]): ReceiveTicketsOrderAction => ({
    type: 'RECEIVE_TICKETS_ORDER',
    orderedTicketIds,
});

type TicketsStateResetAction = {
    type: 'TICKETS_STATE_RESET_ACTION';
}

export const ticketsStateReset = (): TicketsStateResetAction => ({
    type: 'TICKETS_STATE_RESET_ACTION',
});


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
    | SetSelectedTicketAction
    | SetSelectedTicketForEveryoneAction
    | ReceiveSelectedTicketAction
    | SetTicketsOrderAction
    | ReceiveTicketsOrderAction
    | TicketsStateResetAction
