import { socket } from '../services/socket';

import { userJoined } from './actions/estimation/users';
import { receiveEstimation } from './actions/estimation/estimations';
import { receiveTicket } from './actions/estimation/tickets';

import type { StoreType } from './store';
import type { UserType, TicketType, EstimationType } from '../types/commonTypes';

export const listenToEvents = (store: StoreType) => {
    socket.client.on('user-joined', (user: UserType) => {
        store.dispatch(userJoined(user));
    })

    socket.client.on('receive-estimation', (estimation: EstimationType) => {
        store.dispatch(receiveEstimation(estimation));
    })

    socket.client.on('receive-ticket', (ticket: TicketType) => {
        store.dispatch(receiveTicket(ticket));
    })
}
