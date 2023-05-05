import { useMemo } from 'react';
import ClassName from 'classnames';

import { countEstimations, sortCountedEstimations } from '../../../utils/estimations';
import { EstimateCard } from '../../EstimateCard';

import type { UserType } from '../../../types/commonTypes';

import './TeamEstimateLane.scss'

type TeamEstimateLaneProps = {
    className?: string;
    teamName: string;
    users: UserType[];
    reveal?: boolean;
    estimations: {
        [userId: string]: string | null;
    }
}

export const TeamEstimateLane = ({ className, teamName, users, estimations, reveal }: TeamEstimateLaneProps) => {
    const usersSortedByCountedEstimations = useMemo(() => {
        if (!reveal) return users;

        const countedEstimations = countEstimations(estimations, { [teamName]: users })[teamName];
        const sortedEstimations = sortCountedEstimations(countedEstimations);

        return sortedEstimations.reduce<UserType[]>((acc, [estimate]) => {
            const usersForEstimate = users.filter((user) => estimations[user.id] === estimate)
            usersForEstimate.sort((a, b) => a.name.localeCompare(b.name))

            return [...acc, ...usersForEstimate];
        }, [])
    }, [teamName, users, estimations, reveal])


    const fullClassName = ClassName('default-team-estimate-lane', className);

    return (
        <div className={fullClassName}>
            <span className="team-name">
                {teamName}
            </span>

            <div className="cards-lane">
                {usersSortedByCountedEstimations.map((user) => (
                    <div className="estimate-card-container" key={user.id}>
                        <EstimateCard
                            isRevealed={reveal}
                            isSelected={reveal ? false : !!estimations[user.id]}
                            value={estimations[user.id]}
                        />
                        <span className="username">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
