import { Router, type Express } from 'express';

import { sessionRouter } from './session/session.js';
import { userRouter } from './user/user.js';

export const initHTTP = (app: Express) => {
    const apiRouter = Router();

    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/user', userRouter);

    app.use('/api', apiRouter);
}
