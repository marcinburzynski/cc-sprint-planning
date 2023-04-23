import type { Socket } from 'socket.io';
import type { ExtendedError } from 'socket.io/dist/namespace';
import type { EventsMap } from 'socket.io/dist/typed-events';

export type MiddlewareFunction = <
    ListenEvents extends EventsMap,
    EmitEvents extends EventsMap,
    ServerSideEvents extends EventsMap,
    SocketData
>(
    socket: Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>,
    next: (err?: ExtendedError) => void,
) => void
