import { Router, type Express } from 'express';

import { sessionRouter } from './session/session.http.js';
import { userRouter } from './user/user.http.js';
import { jiraRouter } from './jira/jira.http.js';
import { googleRouter } from './google/google.http.js';

export const initHTTP = (app: Express) => {
    const apiRouter = Router();

    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/jira', jiraRouter);
    apiRouter.use('/google', googleRouter);

    app.use('/api', apiRouter);
}
