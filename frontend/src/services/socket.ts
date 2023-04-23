import { io, Socket as SocketIo } from "socket.io-client";

import type { UserType, EstimationType, TicketType } from '../types/commonTypes';
import type { PartialBy } from '../types/utilTypes';

type CreatedUserAndSession = {
    sessionId: string;
    user: UserType;
}

class Socket {

    client: SocketIo;
    sessionId?: string;

    constructor() {
        this.client = io(import.meta.env.TEST_ENV_SOCKET_HOST);
    }

    disconnect = () => {
        this.client?.disconnect();
    }


    createAndJoinSession = async (user: PartialBy<UserType, 'id' | 'team'>, teams: string[]) => {
        const response = await new Promise<CreatedUserAndSession>((resolve) => {
            this.client.emit('create-and-join-session', user, teams, resolve)
        })

        this.sessionId = response.sessionId;

        return response
    }

    joinSession = async (sessionId: string, user: PartialBy<UserType, 'id' | 'team'>) => {
        const response = await new Promise<CreatedUserAndSession>((resolve) => {
            this.client.emit('join-session', sessionId, user, resolve);
        })

        this.sessionId = response.sessionId;

        return response;
    }

    sendEstimation = (estimation: EstimationType) => {
        return new Promise<{ estimation: EstimationType }>((resolve) => {
            this.client.emit('send-estimation', estimation, resolve);
        });
    };

    createTicket = (sessionId: string, ticket: Omit<TicketType, 'id'>) => {
        return new Promise<{ ticket: TicketType }>((resolve) => {
            this.client.emit('create-ticket', sessionId, ticket, resolve);
        });
    }

    revealTicketEstimate = (ticketId: string) => {
        return this.client.emit('reveal-estimate', ticketId);
    }

    getSessionTickets = (sessionId: string) => {
        return new Promise<{ tickets: TicketType[] }>((resolve) => {
            this.client.emit('get-session-tickets', sessionId, resolve);
        })
    }

    getSessionUsers = (sessionId: string) => {
        return new Promise<{ users: UserType[] }>((resolve) => {
            this.client.emit('get-session-users', sessionId, resolve);
        })
    }

    getSessionTeams = (sessionId: string) => {
        return new Promise<{ teams: string[] }>((resolve) => {
            this.client.emit('get-session-teams', sessionId, resolve);
        })
    }

    getSessionEstimates = (sessionId: string) => {
        return new Promise<{ estimates: EstimationType[] }>((resolve) => {
            this.client.emit('get-session-estimates', sessionId, resolve);
        })
    }
}


export const socket = new Socket();
