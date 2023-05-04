import { combineReducers } from 'redux';

import { boardsReducer } from './boards';

export const jiraReducer = combineReducers({
    boards: boardsReducer,
})
