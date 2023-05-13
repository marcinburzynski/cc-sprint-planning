import ClassName from 'classnames';
import { useMemo } from 'react';

import { useTypedSelector } from '../../store/hooks';
import { TeamEstimateLane } from './TeamEstimateLane';
import { getAllTeams, getUsersByTeam } from '../../utils/users';

import type { UserType } from '../../types/commonTypes';

import './EstimateCardsPreview.scss';

type EstimateCardsPreviewProps = {
    className?: string;
    reveal?: boolean;
}

export const EstimateCardsPreview = ({ className, reveal }: EstimateCardsPreviewProps) => {
    const selectedTicketId = useTypedSelector((state) => state.estimation.tickets.selectedTicketId);
    const { data: session } = useTypedSelector((state) => state.estimation.session);
    const { data: estimations } = useTypedSelector((state) => state.estimation.estimations);
    const { data: users } = useTypedSelector((state) => state.estimation.users);

    const estimationsForTicket = selectedTicketId ? estimations[selectedTicketId] : {};

    const activeUsers = useMemo(() => {
        return Object.values(users).filter(({ isSpectator }) => !isSpectator);
    }, [users]);

    const teams = useMemo(() => {
        return getAllTeams(activeUsers);
    }, [activeUsers]);

    const usersByTeam = useMemo<Record<string, UserType[]>>(() => {
        return getUsersByTeam(activeUsers, teams);
    }, [teams]);

    if (!session) return null;

    const fullClassName = ClassName('estimate-cards-preview', className);

    return (
        <div className={fullClassName}>
            {teams.map((team) => (
                <TeamEstimateLane
                    key={team}
                    className="team-lane"
                    deck={session.deck}
                    teamName={team}
                    reveal={reveal}
                    users={usersByTeam[team]}
                    estimations={estimationsForTicket}
                />
            ))}
        </div>
    )
}
