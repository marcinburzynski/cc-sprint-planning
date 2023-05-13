import { Server, Socket } from 'socket.io';

import { prisma } from '../../datasources/prisma.js';

import type { EstimationType, PromiseCallback } from '../../types/commonTypes.js';
import type { Estimation } from '@prisma/client';

export const initEstimationsSocket = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('send-estimation', async (estimation: Omit<EstimationType, 'userId'>, callback: PromiseCallback) => {
        try {
            const previousEstimation = await prisma.estimation.findFirst({
                where: { ticket: { id: estimation.ticketId }, user: { id: socket.data.user.id } }
            });

            let newEstimation: Estimation;

            if (previousEstimation) {
                newEstimation = await prisma.estimation.update({
                    data: { value: estimation.value },
                    where: { id: previousEstimation.id },
                });
            } else {
                newEstimation = await prisma.estimation.create({
                    data: {
                        value: estimation.value,
                        ticket: { connect: { id: estimation.ticketId } },
                        user: { connect: { id: socket.data.user.id } },
                    }
                });
            }

            socket.to(socketSessionId).emit('receive-estimation', newEstimation);
            callback({ estimation: newEstimation });
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('reveal-estimate', async (ticketId: string, callback: PromiseCallback) => {
        try {
            const updatedTicket = await prisma.ticket.update({
                data: { isRevealed: true },
                where: { id: ticketId },
            });

            socket.to(socketSessionId).emit('receive-ticket', updatedTicket);
            callback();
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('restart-estimation', async (ticketId: string, callback: PromiseCallback) => {
        try {
            const updatedTicket = await prisma.ticket.update({
                where: { id: ticketId },
                data: { isRevealed: false },
            });

            socket.to(socketSessionId).emit('receive-ticket', updatedTicket);
            callback();
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('get-session-estimates', async (callback: PromiseCallback) => {
        try {
            const tickets = await prisma.ticket.findMany({ where: { sessionId: socketSessionId } });

            const estimates = await prisma.estimation.findMany({
                where: {
                    ticket: {
                        id: {
                            in: tickets.map(({ id }) => id)
                        }
                    }
                }
            });

            callback({ estimates });
        } catch (e) {
            callback({ error: e })
        }
    });
}
