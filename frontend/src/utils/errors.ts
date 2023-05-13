import { AxiosError } from 'axios';

import { setNotification } from '../store/actions/notifications';

import type { StoreDispatch } from '../store';

export const showErrorViaNotification = (notificationTitle: string, e: unknown, dispatch: StoreDispatch) => {
    if (e instanceof AxiosError) {
        return dispatch(setNotification(notificationTitle, {
            notificationType: 'error',
            description: `${e.code}\n${e.message}\n${e.response?.data.error}`,
        }));
    }

    if (e instanceof Error) {
        return dispatch(setNotification(notificationTitle, {
            notificationType: 'error',
            description: `${e.name}\n${e.message}\n${e.cause}`,
        }));
    }

    dispatch(setNotification(notificationTitle, { notificationType: 'error' }));
};
