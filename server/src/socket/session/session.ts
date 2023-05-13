import { Server, Socket } from 'socket.io';

import { prisma } from '../../datasources/prisma.js';

import type { PromiseCallback } from '../../types/commonTypes.js';


export const initSessionSocket = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('get-session-users', async (callback: PromiseCallback) => {
        try {
            const users = await prisma.user.findMany({ where: { sessions: { some: { id: socketSessionId } } } });

            callback({ users });
        } catch (e) {
            callback({ error: e })
        }
    });

    socket.on('get-session', async (sessionId: string, callback: PromiseCallback) => {
        try {
            const session = await prisma.session.findUnique({ where: { id: sessionId } });

            callback({ session });
        } catch (e) {
            callback({ error: e })
        }
    });
}
