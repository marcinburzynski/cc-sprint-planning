import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isEmpty, omit } from 'lodash';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { socket } from '../../services/socket';
import {
    createTicket,
    getSessionTickets,
    revealTicketEstimate,
    restartTicketEstimation,
    removeTicket,
    setSelectedTicket,
    setSelectedTicketForEveryone,
} from '../../store/actions/estimation/tickets';
import { isCompleteUser } from '../../types/typePredicates';
import { setNotification } from '../../store/actions/notifications';
import { getSession } from '../../store/actions/estimation/session';
import { getSessionUsers } from '../../store/actions/estimation/users';
import { getSessionEstimations, sendEstimation } from '../../store/actions/estimation/estimations';
import { Button } from '../../components/Button';
import { UserAvatar } from '../../components/UserAvatar';
import { TicketManager } from '../../components/TicketManager';
import { EstimateCardsPreview } from '../../components/EstimateCardsPreview';
import { EstimateCardPicker } from '../../components/EstimateCardPicker';
import { EstimationResults } from '../../components/EstimationResults';

import './EstimationPage.scss';

export const EstimationPage = () => {
    const dispatch = useTypedDispatch();
    const navigateTo = useNavigate();
    const { sessionId } = useParams<'sessionId'>()

    const { data: session } = useTypedSelector((state) => state.estimation.session);
    const user = useTypedSelector((state) => state.user);
    const { id: userId, isSpectator, isAdmin } = user

    const {
        selectedTicketId,
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
        if (!sessionId) return;

        if (!socket.token) {
            return navigateTo(`/join/${sessionId}`);
        }

        if (!socket.sessionId && sessionId && socket.token) {
            await socket.joinSession(sessionId, socket.token);
        }

        dispatch(getSession(sessionId))

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

    const getOrderedTickets = () => Object.values(tickets).sort((a, b) => a.order - b.order);

    const handleSelectFirstInOrderTicket = () => {
        const [firstTicket] = getOrderedTickets();

        dispatch(setSelectedTicket(firstTicket.id));
    };

    const handleSelectNextTicketForEstimationInOrder = () => {
        const sortedTickets = getOrderedTickets();
        const [nextTicket] = sortedTickets.filter((ticket) => !ticket.isRevealed)

        if (!nextTicket) return;

        if (isAdmin) {
            return dispatch(setSelectedTicketForEveryone(nextTicket.id));
        }

        dispatch(setSelectedTicket(nextTicket.id));
    }

    const handleCopyShareLink = () => {
        dispatch(setNotification('Sharing link saved to the clipboard!'));
        navigator.clipboard.writeText(`${window.location.origin}/join/${sessionId}`);
    }

    useEffect(() => {
        handleJoinAndLoadData()

        return () => {
            socket.disconnect();
        }
    }, [])

    useEffect(() => {
        if (!selectedTicketId && !isEmpty(tickets)) {
            handleSelectFirstInOrderTicket();
        }
    }, [tickets, selectedTicketId])

    useEffect(() => {
        if (!selectedTicket && selectedTicketId && !isEmpty(tickets)) {
            handleSelectFirstInOrderTicket();
        }
    }, [selectedTicket, tickets])

    const activeUsers = useMemo(() => {
        return Object.values(users).filter(({ isSpectator }) => !isSpectator);
    }, [users])

    return (
        <div className="estimation-page">
            <span className="estimation-page-main-header">Sprint planning</span>

            <div className="cards-container">
                <div className="header-row">
                    <div className="header">
                        <span className="estimating-label">Estimating now:</span>
                        <span className="estimating-ticket">{selectedTicket?.name}</span>
                    </div>

                    {isAdmin && (
                        <Button
                            className="reveal-estimation-button"
                            buttonSize="medium"
                            disabled={!!selectedTicket?.isRevealed || !selectedTicketId || !estimationsForTicket}
                            onClick={() => selectedTicketId && dispatch(revealTicketEstimate(selectedTicketId))}
                        >
                            Reveal Cards
                        </Button>
                    )}
                </div>

                {session && (
                    <EstimateCardsPreview
                        className="cards-preview"
                        deck={session.deck}
                        reveal={selectedTicket?.isRevealed}
                        users={activeUsers}
                        estimations={estimationsForTicket}
                    />
                )}
            </div>

            <div className="side-container">
                <div className="sidebar-header">
                    {isCompleteUser(user) && (
                        <>
                            <UserAvatar user={user} className="user-avatar" />
                            <span className="username">{user.name}</span>
                        </>
                    )}

                    <Button className="share-button" buttonStyle="outline" onClick={handleCopyShareLink}>
                        Share game
                    </Button>
                </div>

                <div className="side-container-card">
                    <span className="side-container-card-header">Issues:</span>
                    {session && (
                        <TicketManager
                            className="ticket-manager"
                            isAdmin={isAdmin}
                            users={Object.values(users)}
                            deck={session.deck}
                            estimations={estimations}
                            tickets={Object.values(tickets)}
                            selectedTicket={selectedTicket}
                            onSelectTicket={(ticket) => dispatch(setSelectedTicket(ticket.id))}
                            onAddTicket={(name) => sessionId && dispatch(createTicket({ name }))}
                            onRemoveTicket={(ticketId) => dispatch(removeTicket(ticketId))}
                            onRestartEstimation={(ticketId) => dispatch(restartTicketEstimation(ticketId))}
                        />
                    )}
                </div>
            </div>

            {selectedTicket?.isRevealed && estimationsForTicket && session && (
                <EstimationResults
                    className="estimation-results"
                    users={Object.values(users)}
                    deck={session.deck}
                    ticketEstimations={estimationsForTicket}
                    onEstimateNextTicket={handleSelectNextTicketForEstimationInOrder}
                />
            )}

            {!isSpectator && !selectedTicket?.isRevealed && userId && selectedTicketId && session && (
                <EstimateCardPicker
                    className="card-picker"
                    deck={session.deck}
                    freeze={selectedTicket?.isRevealed}
                    selectedCard={userEstimation}
                    onChangeSelection={(value) => dispatch(sendEstimation(selectedTicketId, value || null))}
                />
            )}
        </div>
    )
}
