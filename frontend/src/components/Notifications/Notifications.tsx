import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { removeNotification } from '../../store/actions/notifications';
import { NotificationCard } from './NotificationCard';

import './Notifications.scss';

export const Notifications = () => {
    const dispatch = useTypedDispatch();

    const notifications = useTypedSelector((state) => state.notifications);

    return (
        <div className="default-notifications-container">
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClearNotification={({ title }) => dispatch(removeNotification(title))}
                />
            ))}
        </div>
    )
}
