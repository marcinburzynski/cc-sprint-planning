import ClassName from 'classnames';
import { useMemo } from 'react';

import { TeamEstimateLane } from './TeamEstimateLane';

import type { UserType } from '../../types/commonTypes';

import './EstimateCardsPreview.scss';

type EstimateCardsPreviewProps = {
    className?: string;
    reveal?: boolean;
    users: UserType[];
    estimations?: {
        [userId: string]: string | null;
    };
}

export const EstimateCardsPreview = ({ className, estimations = {}, users, reveal }: EstimateCardsPreviewProps) => {
    const teams = useMemo(() => {
        const uniqueTeams = Array.from(new Set(users.map(({ team }) => team)))
        const withoutEmpty = uniqueTeams.filter((team): team is string => !!team)
        return withoutEmpty.sort((a, b) => a.localeCompare(b))
    }, [users])

    const usersByTeam = useMemo<Record<string, UserType[]>>(() => {
        return teams.reduce((acc, curr) => {
            const usersFromTeam = users.filter(({ team }) => team === curr);
            const usersSortedByName = usersFromTeam.sort((a, b) => a.name.localeCompare(b.name));

            return {
                ...acc,
                [curr]: usersSortedByName,
            }
        }, {})
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
