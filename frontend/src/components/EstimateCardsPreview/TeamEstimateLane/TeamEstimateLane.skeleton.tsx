import ClassName from 'classnames';
import { range } from 'lodash';

import { SkeletonLoader } from '../../SkeletonLoader';
import { EstimateCardSkeleton } from '../../EstimateCard';

import './TeamEstimateLane.scss';
import './TeamEstimateLane.skeleton.scss';

type TeamEstimateLaneSkeletonProps = {
    className?: string;
}

export const TeamEstimateLaneSkeleton = ({ className }: TeamEstimateLaneSkeletonProps) => {
    const fullClassName = ClassName('default-team-estimate-lane', 'skeleton-team-estimate-lane', className);

    return (
        <div className={fullClassName}>
            <SkeletonLoader className="team-name" />

            <div className="cards-lane">
                {range(0, 6).map((index) => (
                    <div className="estimate-card-container" key={`${index}`}>
                        <EstimateCardSkeleton />
                        <SkeletonLoader className="username" />
                    </div>
                ))}
            </div>
        </div>
    )
}
