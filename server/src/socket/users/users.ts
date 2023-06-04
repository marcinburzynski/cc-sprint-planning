import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';

import { prisma } from '../../datasources/prisma.js';

import type { UserType, PromiseCallback } from '../../types/commonTypes.js';

export const initUsersSocket = (io: Server, socket: Socket, socketSessionId: string) => {
    socket.on('update-user', async (newUserSettings: Partial<UserType>, callback: PromiseCallback) => {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: socket.data.user.id },
                data: lodash.omit(newUserSettings, 'id'),
            });

            io.to(socketSessionId).emit('receive-updated-user', updatedUser);

            const updatedToken = jwt.sign(updatedUser, process.env.SECRET!);

            callback({ user: updatedUser, token: updatedToken });
        } catch (e: unknown) {
            callback({ error: e })
        }
    })
}
