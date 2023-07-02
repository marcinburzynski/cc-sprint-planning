import lodash from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';

import { prisma, getRegularModelFields } from '../../datasources/prisma.js';

import type { TicketType, PromiseCallback } from '../../types/commonTypes.js';

const ticketModelFields = getRegularModelFields('Ticket').fields;
const getCleanTicketObject = <T extends Record<string, unknown>>(ticket: T) => {
    return lodash.pick(ticket, ...ticketModelFields) as T;
}

export const initTicketsSocket = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('create-ticket', async (ticket: Omit<TicketType, 'id'>, callback: PromiseCallback) => {
        try {
            const savedTicket = await prisma.ticket.create({
                data: {
                    ...getCleanTicketObject(ticket),
                    id: nanoid(),
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
                ...getCleanTicketObject(ticket),
                id: nanoid(),
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

    socket.on('set-tickets-order', async (orderedTicketIds: string[], callback: PromiseCallback) => {
        try {
            const updateTicketOrderQueries = orderedTicketIds.map((id, index) => {
                return prisma.ticket.update({
                    where: { id },
                    data: { order: index + 1 },
                });
            })

            await prisma.$transaction(updateTicketOrderQueries);

            socket.to(socketSessionId).emit('receive-tickets-order', orderedTicketIds);

            callback({ ok: true });
        } catch (e) {
            callback({ error: e });
        }
    })
};
