import { useMemo } from 'react';
import ClassName from 'classnames';

import { countEstimations, sortCountedEstimations } from '../../../utils/estimations';
import { EstimateCard } from '../../EstimateCard';

import type { UserType, EstimateCardType } from '../../../types/commonTypes';

import './TeamEstimateLane.scss'

type TeamEstimateLaneProps = {
    className?: string;
    teamName: string;
    users: UserType[];
    deck: EstimateCardType[];
    reveal?: boolean;
    estimations?: {
        [userId: string]: string | null;
    }
}

export const TeamEstimateLane = ({
    className,
    teamName,
    users,
    deck,
    estimations = {},
    reveal,
}: TeamEstimateLaneProps) => {
    const usersSortedByCountedEstimations = useMemo(() => {
        if (!reveal) return users;

        const countedEstimates = countEstimations(estimations, { [teamName]: users })[teamName];
        const sortedEstimates = sortCountedEstimations(countedEstimates);

        const sortedUsersWithEstimate = sortedEstimates.reduce<UserType[]>((acc, [estimate]) => {
            const usersForEstimate = users.filter((user) => estimations[user.id] === estimate)
            usersForEstimate.sort((a, b) => a.name.localeCompare(b.name))

            return [...acc, ...usersForEstimate];
        }, [])

        const sortedUsersWithoutEstimate = users
            .filter((user) => !sortedUsersWithEstimate.includes(user))
            .sort((a, b) => a.name.localeCompare(b.name));

        return [
            ...sortedUsersWithEstimate,
            ...sortedUsersWithoutEstimate,
        ]
    }, [teamName, users, estimations, reveal]);

    const labelCardHashmap = useMemo(() => {
        return deck.reduce<Record<string, EstimateCardType>>((acc, curr) => ({
            ...acc,
            [curr.label]: curr
        }), {})
    }, [deck])

    const getEstimateCard = (userId: string) => {
        const estimationLabelForUser = estimations?.[userId];

        if (!estimationLabelForUser) return;

        return labelCardHashmap[estimationLabelForUser];
    }

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
                            card={getEstimateCard(user.id)}
                        />
                        <span className="username">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
