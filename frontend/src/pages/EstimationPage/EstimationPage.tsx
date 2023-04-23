import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isEmpty, omit } from 'lodash';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { socket } from '../../services/socket';
import { createTicket, getSessionTickets, revealTicketEstimate } from '../../store/actions/estimation/tickets';
import { getSessionUsers } from '../../store/actions/estimation/users';
import { getSessionEstimations, sendEstimation } from '../../store/actions/estimation/estimations';
import { Button } from '../../components/Button';
import { TicketManagerSidebar } from '../../components/TicketManagerSidebar';
import { EstimateCardsPreview } from '../../components/EstimateCardsPreview';
import { EstimateCardPicker } from '../../components/EstimateCardPicker';

import type { UserType } from '../../types/commonTypes';

import './EstimationPage.scss';

const isCompleteUser = (user: Partial<UserType>): user is UserType => (
    !!(user.id && user.name)
)

export const EstimationPage = () => {
    const dispatch = useTypedDispatch();
    const navigateTo = useNavigate();
    const { sessionId } = useParams<'sessionId'>()

    const [selectedTicketId, setSelectedTicketId] = useState<string>();

    const user = useTypedSelector((state) => state.user);
    const { id: userId, isSpectator } = user

    const {
        data: tickets,
        loading: loadingTickets,
        isEmpty: noTicketsAdded,
    } = useTypedSelector((state) => state.estimation.tickets);

    const {
        data: estimations,
        loading: loadingEstimations,
    } = useTypedSelector((state) => state.estimation.estimations);

    const {
        data: users,
        loading: loadingUsers,
        isEmpty: noUsersInSession,
    } = useTypedSelector((state) => state.estimation.users);


    const selectedTicket = selectedTicketId ? tickets[selectedTicketId] : undefined;
    const estimationsForTicket = selectedTicketId ? estimations[selectedTicketId] : undefined;
    const userEstimation = estimationsForTicket && userId ? estimationsForTicket[userId] : undefined

    const handleJoinAndLoadData = async () => {
        if (!socket.sessionId && sessionId && isCompleteUser(user)) {
            await socket.joinSession(sessionId, user);
        }

        if (!loadingTickets && !noTicketsAdded && isEmpty(tickets) && sessionId) {
            dispatch(getSessionTickets(sessionId));
        }

        if (!loadingUsers && !noUsersInSession && userId && isEmpty(omit(users, userId)) && sessionId) {
            dispatch(getSessionUsers(sessionId));
        }

        if (!loadingEstimations && isEmpty(estimations) && sessionId) {
            dispatch(getSessionEstimations(sessionId));
        }
    }

    useEffect(() => {
        if (!user.id) {
            return navigateTo(`/join/${sessionId}`);
        }

        handleJoinAndLoadData()
    }, [])

    useEffect(() => {
        if (!selectedTicketId && !isEmpty(tickets)) {
            const firstTicket = Object.values(tickets).find(({ order }) => order === 1)

            if (firstTicket) {
                setSelectedTicketId(firstTicket.id)
            }
        }
    }, [tickets, selectedTicketId])

    const activeUsers = useMemo(() => {
        return Object.values(users).filter(({ isSpectator }) => !isSpectator);
    }, [users])

    return (
        <div className="estimation-page">
            <div className="cards-container">
                <div className="header">
                    <span className="estimating-label">Estimating now:</span>
                    <span className="estimating-ticket">{selectedTicket?.name}</span>
                </div>

                <EstimateCardsPreview
                    className="cards-preview"
                    reveal={selectedTicket?.isRevealed}
                    users={activeUsers}
                    estimations={estimationsForTicket}
                />
            </div>

            <div className="side-container">
                <TicketManagerSidebar
                    isSpectator={isSpectator}
                    tickets={Object.values(tickets)}
                    selectedTicket={selectedTicket}
                    onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
                    onAddTicket={(name) => sessionId && dispatch(createTicket(sessionId, name))}
                />

                {isSpectator && !selectedTicket?.isRevealed && selectedTicketId && (
                    <Button
                        className="reveal-estimation-button"
                        onClick={() => dispatch(revealTicketEstimate(selectedTicketId))}
                    >
                        Reveal Estimate
                    </Button>
                )}
            </div>

            {!isSpectator && userId && selectedTicketId ? (
                <EstimateCardPicker
                    className="card-picker"
                    freeze={selectedTicket?.isRevealed}
                    selectedCard={userEstimation}
                    onChangeSelection={(value) => dispatch(sendEstimation(selectedTicketId, userId, value || null))}
                />
            ) : null}
        </div>
    )
}
