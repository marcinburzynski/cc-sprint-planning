import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io'


export const authenticateMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const { token } = socket.handshake.auth;

    const isAuthorized = jwt.verify(token, process.env.SECRET!)

    if (!isAuthorized) {
        return void next(new Error('unauthorised'))
    }

    next()
}
