import { combineReducers } from 'redux';

import { estimationsReducer } from './estimations';
import { ticketsReducer } from './tickets';
import { usersReducer } from './users';

export const estimationReducer = combineReducers({
    estimations: estimationsReducer,
    tickets: ticketsReducer,
    users: usersReducer,
})
