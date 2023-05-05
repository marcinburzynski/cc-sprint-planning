import { combineReducers } from 'redux';

import { userReducer } from './user';
import { estimationReducer } from './estimation';
import { jiraReducer } from './jira';
import { notificationsReducer } from './notifications';

export const rootReducer = combineReducers({
    user: userReducer,
    jira: jiraReducer,
    estimation: estimationReducer,
    notifications: notificationsReducer,
})

export type RootReducerState = ReturnType<typeof rootReducer>
