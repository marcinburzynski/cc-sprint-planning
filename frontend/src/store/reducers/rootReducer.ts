import { combineReducers } from 'redux';

import { userReducer } from './user';
import { estimationReducer } from './estimation';
import { jiraReducer } from './jira';

export const rootReducer = combineReducers({
    user: userReducer,
    jira: jiraReducer,
    estimation: estimationReducer,
})

export type RootReducerState = ReturnType<typeof rootReducer>
