import ClassName from 'classnames';
import { useMemo } from 'react';

import { TeamEstimateLane } from './TeamEstimateLane';
import { getAllTeams, getUsersByTeam } from '../../utils/users';

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
    const teams = useMemo(() => getAllTeams(users), [users])
    const usersByTeam = useMemo<Record<string, UserType[]>>(() => getUsersByTeam(users, teams), [teams])

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
