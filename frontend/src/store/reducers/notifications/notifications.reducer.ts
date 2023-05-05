import { produce } from 'immer';
import { nanoid } from 'nanoid';

import type { NotificationsActionTypes } from '../../actions/notifications';

export type NotificationTypes =
    | 'default'
    | 'error'

export type Notification = {
    id: string;
    title: string;
    description?: string;
    type: NotificationTypes;
}

type NotificationsReducerState = Notification[];

const NotificationsDefaultState: NotificationsReducerState = [];

export const notificationsReducer = (state = NotificationsDefaultState, action: NotificationsActionTypes) => produce(state, (draft) => {
    switch (action.type) {
        case 'SET_NOTIFICATION':
            draft.push({
                id: nanoid(),
                title: action.title,
                type: action.notificationType,
                description: action.description,
            });
            break;

        case 'REMOVE_NOTIFICATION':
            return state.filter((notification) => notification.title !== action.title);

        default:
            return state;
    }
});
