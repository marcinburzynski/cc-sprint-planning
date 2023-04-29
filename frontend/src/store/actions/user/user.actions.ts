import type { UserType } from '../../../types/commonTypes';
import type { PartialBy } from '../../../types/utilTypes';

export type SetUserAction = {
    type: 'SET_USER';
    user: PartialBy<UserType, 'team'>
}

export const setUser = (user: UserType): SetUserAction => ({
    type: 'SET_USER',
    user,
})

export type UserActionTypes =
    | SetUserAction
