import { combineReducers } from 'redux';

import { userReducer } from './user';
import { estimationReducer } from './estimation';

export const rootReducer = combineReducers({
    user: userReducer,
    estimation: estimationReducer,
})

export type RootReducerState = ReturnType<typeof rootReducer>
