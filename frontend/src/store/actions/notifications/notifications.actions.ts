import type { NotificationTypes } from '../../reducers/notifications';

export type SetNotificationAction = {
    type: 'SET_NOTIFICATION';
    title: string;
    notificationType: NotificationTypes;
    description?: string;
}

type NotificationOptions = {
    description?: string;
    notificationType?: NotificationTypes;
}

const DefaultNotificationOptions: NotificationOptions = {
   notificationType: 'default',
}

export const setNotification = (
    title: string,
    {
        notificationType = 'default',
        description,
    }: NotificationOptions = DefaultNotificationOptions,
): SetNotificationAction => ({
    type: 'SET_NOTIFICATION',
    title,
    notificationType,
    description,
})

type RemoveNotificationAction = {
    type: 'REMOVE_NOTIFICATION';
    title: string;
}

export const removeNotification = (title: string): RemoveNotificationAction => ({
    type: 'REMOVE_NOTIFICATION',
    title,
})

export type NotificationsActionTypes =
    | SetNotificationAction
    | RemoveNotificationAction
