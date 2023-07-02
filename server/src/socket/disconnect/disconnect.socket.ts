import type { Server, Socket } from 'socket.io';
import lodash from 'lodash';

import { prisma } from '../../datasources/prisma.js';

export const initDisconnectEvent = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('disconnect', async () => {
        try {
            const userEstimates = await prisma.estimation.findMany({
                where: {
                    user: { id: socket.data.user.id },
                    ticket: { session: { id: socketSessionId } },
                },
            });

            if (!lodash.isEmpty(userEstimates)) return;

            await prisma.session.update({
                where: { id: socketSessionId },
                data: {
                    users: { disconnect: { id: socket.data.user.id } },
                },
            });

            socket.to(socketSessionId).emit('user-removed', socket.data.user.id);
        } catch (e) {
            console.error(e);
        }
    });
};
