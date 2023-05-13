import lodash from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';

import { prisma } from '../../datasources/prisma.js';

import type { TicketType, PromiseCallback } from '../../types/commonTypes.js';

export const initTicketsSocket = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('create-ticket', async (ticket: Omit<TicketType, 'id'>, callback: PromiseCallback) => {
        try {
            const savedTicket = await prisma.ticket.create({
                data: {
                    id: nanoid(),
                    name: ticket.name,
                    order: ticket.order,
                    issueKey: ticket.issueKey,
                    isRevealed: ticket.isRevealed || false,
                    session: {
                        connect: { id: socketSessionId },
                    }
                }
            });

            socket.to(socketSessionId).emit('receive-ticket', savedTicket);
            callback({ ticket: savedTicket });
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('create-multiple-tickets', async (tickets: Omit<TicketType, 'id'>[], callback: PromiseCallback) => {
        try {
            const completeTickets = tickets.map((ticket) => ({
                id: nanoid(),
                name: ticket.name,
                order: ticket.order,
                issueKey: ticket.issueKey,
                isRevealed: ticket.isRevealed || false,
                sessionId: socketSessionId,
            }));

            await prisma.ticket.createMany({ data: completeTickets });

            const withoutSessionId = completeTickets.map((ticket) => lodash.omit(ticket, 'sessionId'));

            socket.to(socketSessionId).emit('receive-multiple-tickets', withoutSessionId);
            callback({ tickets: withoutSessionId });
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('remove-ticket', async (ticketId: string, callback: PromiseCallback) => {
        try {
            const updateQuery = prisma.ticket.update({
                where: { id: ticketId },
                data: {
                    estimations: {
                        deleteMany: {},
                    },
                }
            });

            const deleteQuery = prisma.ticket.delete({ where: { id: ticketId } });

            await prisma.$transaction([updateQuery, deleteQuery]);

            socket.to(socketSessionId).emit('receive-remove-ticket', ticketId);
            callback();
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('get-session-tickets', async (callback: PromiseCallback) => {
        try {
            const tickets = await prisma.ticket.findMany({ where: { sessionId: socketSessionId } });

            callback({ tickets });
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('set-selected-ticket-for-everyone', (ticketId: string, callback: PromiseCallback) => {
        try {
            socket.to(socketSessionId).emit('receive-selected-ticket-for-everyone', ticketId);
            callback();
        } catch (e) {
            callback({ error: e })
        }
    });
};
