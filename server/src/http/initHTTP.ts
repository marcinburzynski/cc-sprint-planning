import type { Express } from 'express';

import { initSessionRoutes } from './session/session.js';
import { initUserRoutes } from './user/user.js';

export const initHTTP = (app: Express) => {
    initSessionRoutes(app);
    initUserRoutes(app);
}
