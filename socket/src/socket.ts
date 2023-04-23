import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { PrismaClient, type User, type Estimation } from '@prisma/client';

import { authenticateMiddleware } from './middlewares/auth.js';
import type { UserType, EstimationType, TicketType } from './types/commonTypes.js';
import type { PartialBy } from './types/utilTypes.js';

const main = async () => {
    const prisma = new PrismaClient();
    const io = new Server(3000, { cors: { origin: '*' } });
    let socketSessionId: string | undefined

    io.on('connection', (socket) => {

        socket.on('create-and-join-session', async (user: PartialBy<UserType, 'id' | 'team'>, teams: string[], callback) => {
            let savedUser: User

            if (user.id) {
                savedUser = await prisma.user.findUnique({ where: { id: user.id } }) as User
            } else {
                savedUser = await prisma.user.create({
                    data: {
                        ...user,
                        id: nanoid(),
                    }
                })
            }

            const session = await prisma.session.create({
                data: {
                    id: nanoid(),
                    users: {
                        connect: [{ id: savedUser.id }],
                    },
                }
            })

            await prisma.team.createMany({
                data: teams.map((team) => ({
                    sessionId: session.id,
                    name: team,
                }))
            })

            socketSessionId = session.id;

            socket.join(session.id)
            socket.to(session.id).emit('user-joined', savedUser)

            callback({ sessionId: session.id, user: savedUser });
        });

        socket.on('join-session', async (sessionId: string, user: PartialBy<UserType, 'id'>, callback) => {
            let savedUser: User

            if (user.id) {
                savedUser = await prisma.user.findUnique({ where: { id: user.id } }) as User
            } else {
                savedUser = await prisma.user.create({
                    data: {
                        ...user,
                        id: nanoid(),
                    }
                })
            }

            const session = await prisma.session.findUnique({ where: { id: sessionId } });

            if (!session) {
                return callback({ error: 'session not found' })
            }

            socketSessionId = session.id

            await prisma.session.update({
                data: {
                    users: {
                        connect: [{ id: savedUser.id }]
                    },
                },
                where: {
                    id: sessionId,
                }
            })

            socket.join(session.id)
            socket.to(session.id).emit('user-joined', savedUser)

            callback({ sessionId: session.id, user: savedUser })
        })

        socket.on('send-estimation', async (estimation: EstimationType, callback) => {
            const previousEstimation = await prisma.estimation.findFirst({
                where: { ticket: { id: estimation.ticketId }, user: { id: estimation.userId } }
            })

            let newEstimation: Estimation

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
                        user: { connect: { id: estimation.userId } },
                    }
                });
            }

            socket.to(socketSessionId!).emit('receive-estimation', newEstimation)
            callback({ estimation: newEstimation })
        })

        socket.on('create-ticket', async (sessionId: string, ticket: Omit<TicketType, 'id'>, callback) => {
            const savedTicket = await prisma.ticket.create({
                data: {
                    id: nanoid(),
                    name: ticket.name,
                    order: ticket.order,
                    isRevealed: ticket.isRevealed || false,
                    session: {
                        connect: { id: sessionId },
                    }
                }
            })

            socket.to(sessionId).emit('receive-ticket', savedTicket)
            callback({ ticket: savedTicket })
        })

        socket.on('reveal-estimate', async (ticketId: string) => {
            const updatedTicket = await prisma.ticket.update({
                data: { isRevealed: true },
                where: { id: ticketId },
            });

            socket.to(socketSessionId!).emit('receive-ticket', updatedTicket)
        })

        socket.on('get-session-tickets', async (sessionId: string, callback) => {
            const tickets = await prisma.ticket.findMany({ where: { sessionId } });

            callback({ tickets })
        })

        socket.on('get-session-users', async (sessionId: string, callback) => {
            const users = await prisma.user.findMany({ where: { sessions: { some: { id: sessionId } } } });

            callback({ users })
        })

        socket.on('get-session-teams', async (sessionId: string, callback) => {
            const teams = await prisma.team.findMany({ where: { sessionId } });

            callback({ teams: teams.map(({ name }) => name) })
        })

        socket.on('get-session-estimates', async (sessionId: string, callback) => {
            const tickets = await prisma.ticket.findMany({ where: { sessionId } });

            const estimates = await prisma.estimation.findMany({
                where: {
                    ticket: {
                        id: {
                            in: tickets.map(({ id }) => id)
                        }
                    }
                }
            });

            callback({ estimates })
        })
    });
};

main();
