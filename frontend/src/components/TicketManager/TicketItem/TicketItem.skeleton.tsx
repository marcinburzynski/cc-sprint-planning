import ClassName from 'classnames';

import { SkeletonLoader } from '../../SkeletonLoader';

import './TicketItem.scss';
import './TicketItem.skeleton.scss';

type TicketItemSkeletonProps = {
    className?: string;
}

export const TicketItemSkeleton = ({ className }: TicketItemSkeletonProps) => {
    const fullClassName = ClassName('default-ticket-item', 'skeleton-ticket-item', className);

    return (
        <div className={fullClassName}>
            <div className="ticket-description">
                <SkeletonLoader className="ticket-name" />

                <SkeletonLoader className="estimation-status" />
            </div>

            <SkeletonLoader className="estimate-sum-display" />
        </div>
    )
}
