import type { Server } from 'socket.io';

type RemoteSocketType = {
    socket?: Server;
}

export const SocketContainer: RemoteSocketType = {
    socket: undefined,
};