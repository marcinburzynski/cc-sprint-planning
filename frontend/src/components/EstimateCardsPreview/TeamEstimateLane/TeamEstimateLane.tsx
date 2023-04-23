import ClassName from 'classnames';
import { useMemo } from 'react';
import { pick } from 'lodash';

import { EstimateCard, EstimateCardMode } from '../../EstimateCard';

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

const formatEstValue = (estValue: string) => {
    const asNum = parseInt(estValue);

    if (isNaN(asNum)) return estValue;

    return `${estValue}SP`
}

export const TeamEstimateLane = ({ className, teamName, users, estimations, reveal }: TeamEstimateLaneProps) => {

    const countedEstimationsLabel = useMemo(() => {
        const currentTeamUserIds = users.filter(({ team }) => team === teamName).map(({ id }) => id);
        const currentTeamEstimations = pick(estimations, currentTeamUserIds)

        const counted = Object.values(currentTeamEstimations).reduce((acc, curr) => {
            if (!curr) return acc;

            if (acc[curr]) {
                acc[curr] += 1
            } else {
                acc[curr] = 1
            }

            return acc
        }, {} as Record<string, number>)

        const sorted = Object.entries(counted).sort(([, aCount], [, bCount]) => bCount - aCount)

        return sorted.reduce((acc, [value, count]) => (
            acc ? `${acc} | ${count}x${formatEstValue(value)}` : `${count}x${formatEstValue(value)}`
        ), '')
    }, [estimations])

    const getCardMode = (user: UserType) => {
        if (reveal) {
            return EstimateCardMode.FrontSideNotSelected;
        }

        if (estimations[user.id]) {
            return EstimateCardMode.BackSideSelected;
        }

        return EstimateCardMode.BackSideNotSelected;
    }

    const fullClassName = ClassName('default-team-estimate-lane', className);

    return (
        <div className={fullClassName}>
            <span className="team-name">
                {`${teamName}${reveal ? `: ${countedEstimationsLabel}` : ''}`}
            </span>

            <div className="cards-lane">
                {users.map((user) => (
                    <div className="estimate-card-container" key={user.id}>
                        <EstimateCard mode={getCardMode(user)} value={estimations[user.id]} />
                        <span className="username">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
