import ClassName from 'classnames';
import { useMemo } from 'react';

import { TeamEstimateLane } from './TeamEstimateLane';

import type { UserType, EstimationType } from '../../types/commonTypes';

import './EstimateCardsPreview.scss';

type EstimateCardsPreviewProps = {
    className?: string;
    reveal?: boolean;
    users: UserType[];
    estimations?: {
        [userId: string]: string;
    };
}

export const EstimateCardsPreview = ({ className, estimations = {}, users, reveal }: EstimateCardsPreviewProps) => {

    const teams = useMemo(() => {
        const uniqueTeams = Array.from(new Set(users.map(({ team }) => team)))

        return uniqueTeams.filter((team): team is string => !!team)
    }, [users])

    const usersByTeam = useMemo<Record<string, UserType[]>>(() => {
        return teams.reduce((acc, curr) => ({
            ...acc,
            [curr]: users.filter(({ team }) => team === curr),
        }), {})
    }, [teams])

    const fullClassName = ClassName('estimate-cards-preview', className);

    return (
        <div className={fullClassName}>
            {teams.map((team) => (
                <TeamEstimateLane
                    key={team}
                    className="team-lane"
                    teamName={team}
                    reveal={reveal}
                    users={usersByTeam[team]}
                    estimations={estimations}
                />
            ))}
        </div>
    )
}
