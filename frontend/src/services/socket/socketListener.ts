import { Socket } from 'socket.io-client';

import { userJoined } from '../../store/actions/estimation/users';
import { receiveEstimation } from '../../store/actions/estimation/estimations';
import { receiveTicket } from '../../store/actions/estimation/tickets';

import type { StoreType } from '../../store/store';
import type { UserType, TicketType, EstimationType } from '../../types/commonTypes';

export const listenToEvents = (socket: Socket, store: StoreType) => {
    socket.on('user-joined', (user: UserType) => {
        store.dispatch(userJoined(user));
    })

    socket.on('receive-estimation', (estimation: EstimationType) => {
        store.dispatch(receiveEstimation(estimation));
    })

    socket.on('receive-ticket', (ticket: TicketType) => {
        store.dispatch(receiveTicket(ticket));
    })
}
