import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isEmpty, omit } from 'lodash';
import ClassName from 'classnames';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { socket } from '../../services/socket';
import { createTicket, getSessionTickets, revealTicketEstimate } from '../../store/actions/estimation/tickets';
import { getSessionUsers } from '../../store/actions/estimation/users';
import { getSessionEstimations, sendEstimation } from '../../store/actions/estimation/estimations';
import { Button } from '../../components/Button';
import { TicketManagerSidebar } from '../../components/TicketManagerSidebar';
import { EstimateCardsPreview } from '../../components/EstimateCardsPreview';
import { EstimateCardPicker } from '../../components/EstimateCardPicker';

import './EstimationPage.scss';

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
        if (!socket.token) {
            return navigateTo(`/join/${sessionId}`);
        }

        if (!socket.sessionId && sessionId && socket.token) {
            await socket.joinSession(sessionId, socket.token);
        }

        if (!loadingTickets && !noTicketsAdded && isEmpty(tickets)) {
            dispatch(getSessionTickets());
        }

        if (!loadingUsers && !noUsersInSession && userId && isEmpty(omit(users, userId))) {
            dispatch(getSessionUsers());
        }

        if (!loadingEstimations && isEmpty(estimations)) {
            dispatch(getSessionEstimations());
        }
    }

    useEffect(() => {
        handleJoinAndLoadData()

        return () => {
            socket.disconnect()
        }
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

    const sidebarFullClassName = ClassName('side-container', {
        'side-container--spectator': isSpectator,
    })

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

            <div className={sidebarFullClassName}>
                <TicketManagerSidebar
                    isSpectator={isSpectator}
                    tickets={Object.values(tickets)}
                    selectedTicket={selectedTicket}
                    onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
                    onAddTicket={(name) => sessionId && dispatch(createTicket(name))}
                />

                {isSpectator && (
                    <Button
                        className="reveal-estimation-button"
                        disabled={!!selectedTicket?.isRevealed || !selectedTicketId}
                        onClick={() => selectedTicketId && dispatch(revealTicketEstimate(selectedTicketId))}
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
                    onChangeSelection={(value) => dispatch(sendEstimation(selectedTicketId, value || null))}
                />
            ) : null}
        </div>
    )
}
