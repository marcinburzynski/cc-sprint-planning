import { Router, type Express } from 'express';

import { sessionRouter } from './session/session.js';
import { userRouter } from './user/user.js';
import { jiraRouter } from './jira/jira.js';
import { googleRouter } from './google/google.js';

export const initHTTP = (app: Express) => {
    const apiRouter = Router();

    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/jira', jiraRouter);
    apiRouter.use('/google', googleRouter);

    app.use('/api', apiRouter);
}
