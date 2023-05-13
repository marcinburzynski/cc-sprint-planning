import ClassName from 'classnames';

import { SkeletonLoader } from '../SkeletonLoader';

import './EstimateCard.scss';
import './EstimateCard.skeleton.scss';

type EstimateCardSkeletonProps = {
    className?: string;
}

export const EstimateCardSkeleton = ({ className }: EstimateCardSkeletonProps) => {
    const fullClassName = ClassName('default-card', 'skeleton-card', className);

    return (
        <div className={fullClassName}>
            <SkeletonLoader className="card-value-loader" />
        </div>
    )
}

