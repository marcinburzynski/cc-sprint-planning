import ClassName from 'classnames';

import { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import type { Notification, NotificationTypes } from '../../../store/reducers/notifications';

import { ReactComponent as XMarkIconSVG } from '../../../assets/icons/xmark.svg';

import './NotificationCard.scss';

const DEFAULT_HIDE_TIMEOUTS = {
    default: 5000,
    error: 15000,
} satisfies Record<NotificationTypes, number>;

type NotificationCardProps = {
    notification: Notification;
    onClearNotification: (notification: Notification) => void;
}

export const NotificationCard = ({ notification, onClearNotification }: NotificationCardProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const showCardTimeout = window.setTimeout(() => {
            setIsVisible(true);
        }, 100)

        let clearNotificationTimeout: number;

        const hideNotificationTimeout = window.setTimeout(() => {
            setIsVisible(false);

            clearNotificationTimeout = window.setTimeout(() => {
                onClearNotification(notification);
            }, 500)
        }, DEFAULT_HIDE_TIMEOUTS[notification.type])

        return () => {
            window.clearTimeout(showCardTimeout);
            window.clearTimeout(hideNotificationTimeout);
            window.clearTimeout(clearNotificationTimeout);
        }
    }, [])

    const fullClassName = ClassName('default-notification-card', `default-notification-card--${notification.type}`, {
        'default-notification-card--with-description': !!notification.description,
    })

    return (
        <CSSTransition
            mountOnEnter
            unmountOnExit
            nodeRef={containerRef}
            in={isVisible}
            timeout={400}
            classNames="default-notification-card"
        >
            <div ref={containerRef} className={fullClassName}>
                <div className="notification-text">
                    <span className="notification-title">{notification.title}</span>
                    {notification.description && (
                        <span className="notification-description">{notification.description}</span>
                    )}
                </div>
                <XMarkIconSVG onClick={() => onClearNotification(notification)} />
            </div>
        </CSSTransition>
    )
}
