import thunk, { ThunkDispatch } from 'redux-thunk';
import { createStore, applyMiddleware, AnyAction } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

import { rootReducer } from './reducers/rootReducer';
import { getPreloadedState } from './getPreloadedState';

export const store = createStore(
    rootReducer,
    getPreloadedState(),
    composeWithDevTools(applyMiddleware(thunk)),
)

export type StoreType = typeof store;
export type StoreStateType = ReturnType<typeof store.getState>;
export type StoreDispatch = ThunkDispatch<StoreStateType, any, AnyAction>;
