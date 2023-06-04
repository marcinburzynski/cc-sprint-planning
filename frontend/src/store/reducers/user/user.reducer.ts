import { produce } from 'immer';

import type { UserActionTypes } from '../../actions/user';
import type { UserType } from '../../../types/commonTypes';

type UserReducerState = Partial<UserType>

const UserDefaultState: UserReducerState = {}

export const userReducer = (state = UserDefaultState, action: UserActionTypes): UserReducerState => produce(state, (draft) => {
    switch (action.type) {
        case 'SET_USER':
            return action.user;

        case 'UPDATE_USER_SUCCESS':
            return action.user;

        default:
            return state
    }
})
