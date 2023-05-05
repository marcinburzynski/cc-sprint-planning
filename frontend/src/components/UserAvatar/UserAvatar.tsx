import ClassName from 'classnames';
import { useMemo } from 'react';

import type { UserType } from '../../types/commonTypes';

import './UserAvatar.scss';

type UserAvatarProps = JSX.IntrinsicElements['div'] & {
    user: UserType;
}

export const UserAvatar = ({ className, user, ...props }: UserAvatarProps) => {
    const initials = useMemo(() => {
        const parts = user.name.split(' ');

        const firstPart = parts[0];
        const lastPart = parts.at(-1);

        if (!lastPart) return '';

        return `${firstPart[0]}${lastPart[0]}`.toUpperCase()
    }, [user]);


    const fullClassName = ClassName('default-user-avatar', className);

    return (
        <div className={fullClassName} {...props}>
            {initials}
        </div>
    )
}
