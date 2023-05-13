import ClassName from 'classnames';
import { useMemo } from 'react';
import { range } from 'lodash';

import { useTypedSelector } from '../../store/hooks';
import { TeamEstimateLane, TeamEstimateLaneSkeleton } from './TeamEstimateLane';
import { getAllTeams, getUsersByTeam } from '../../utils/users';

import type { UserType } from '../../types/commonTypes';

import './EstimateCardsPreview.scss';

type EstimateCardsPreviewProps = {
    className?: string;
    reveal?: boolean;
}

export const EstimateCardsPreview = ({ className, reveal }: EstimateCardsPreviewProps) => {
    const selectedTicketId = useTypedSelector((state) => state.estimation.tickets.selectedTicketId);
    const {
        data: session,
        loading: loadingSession,
    } = useTypedSelector((state) => state.estimation.session);

    const {
        data: estimations,
        loading: loadingEstimations,
    } = useTypedSelector((state) => state.estimation.estimations);

    const {
        data: users,
        loading: loadingUsers,
    } = useTypedSelector((state) => state.estimation.users);

    const isLoading = loadingSession || loadingEstimations || loadingUsers;
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

    const fullClassName = ClassName('estimate-cards-preview', className);

    return (
        <div className={fullClassName}>
            {isLoading || !session
                ? range(0, 2).map((index) => (
                    <TeamEstimateLaneSkeleton className="team-lane" key={`${index}`} />
                ))
                : teams.map((team) => (
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
