import type { ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';

import type { StoreStateType } from './store';

export type TypedThunkAction<
    BasicAction extends Action = Action,
    ExtraThunkArg = void,
> = ThunkAction<any, StoreStateType, ExtraThunkArg, BasicAction>
