import * as jwt from 'jsonwebtoken';

import type { MiddlewareFunction } from './types';

export const authenticateMiddleware: MiddlewareFunction = (socket, next) => {
    const { token } = socket.handshake.auth;

    const isAuthorized = jwt.verify(token, process.env.SECRET!)

    if (!isAuthorized) {
        return void next(new Error('unauthorised'))
    }

    next()
}
