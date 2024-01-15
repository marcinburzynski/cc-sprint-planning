import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { socket } from '../../services/socket';
import {
    getSessionTickets,
    revealTicketEstimate,
    setSelectedTicket,
    ticketsStateReset,
} from '../../store/actions/estimation/tickets';
import { getSession, sessionStateReset } from '../../store/actions/estimation/session';
import { getSessionUsers, usersStateReset } from '../../store/actions/estimation/users';
import { getSessionEstimations, estimationsStateReset } from '../../store/actions/estimation/estimations';
import { setNotification } from '../../store/actions/notifications';
import { isCompleteUser } from '../../types/typePredicates';
import { LogoHeader } from '../../components/LogoHeader';
import { Button } from '../../components/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { UserProfile } from '../../components/UserProfile';
import { TicketManager } from '../../components/TicketManager';
import { EstimateCardsPreview } from '../../components/EstimateCardsPreview';
import { EstimateCardPicker } from '../../components/EstimateCardPicker';
import { EstimationResults } from '../../components/EstimationResults';

import './EstimationPage.scss';

export const EstimationPage = () => {
    const dispatch = useTypedDispatch();
    const navigateTo = useNavigate();
    const { sessionId } = useParams<'sessionId'>()

    const user = useTypedSelector((state) => state.user);
    const { data: estimations } = useTypedSelector((state) => state.estimation.estimations);
    const {
        selectedTicketId,
        data: tickets,
        loading: loadingTickets,
    } = useTypedSelector((state) => state.estimation.tickets);

    const selectedTicket = selectedTicketId ? tickets[selectedTicketId] : undefined;
    const estimationsForTicket = selectedTicketId ? estimations[selectedTicketId] : undefined;

    const handleJoinAndLoadData = async () => {
        if (!sessionId) return;

        if (!socket.token) {
            return navigateTo(`/join/${sessionId}`);
        }

        if (!socket.sessionId && sessionId && socket.token) {
            await socket.joinSession(sessionId, socket.token);
        }

        dispatch(getSession(sessionId));
        dispatch(getSessionTickets());
        dispatch(getSessionUsers());
        dispatch(getSessionEstimations());
    }

    const handleSelectFirstInOrderTicket = () => {
        const [firstTicket] = Object.values(tickets).sort((a, b) => a.order - b.order);

        dispatch(setSelectedTicket(firstTicket.id));
    };

    const handleCopyShareLink = () => {
        dispatch(setNotification('Sharing link saved to the clipboard!'));
        navigator.clipboard.writeText(`${window.location.origin}/join/${sessionId}`);
    }

    useEffect(() => {
        handleJoinAndLoadData()

        return () => {
            socket.disconnect();
            dispatch(sessionStateReset());
            dispatch(ticketsStateReset());
            dispatch(usersStateReset());
            dispatch(estimationsStateReset());
        }
    }, [])

    useEffect(() => {
        // When no ticket is selected
        if (!selectedTicketId && !isEmpty(tickets)) {
            handleSelectFirstInOrderTicket();
        }
    }, [tickets, selectedTicketId])

    useEffect(() => {
        // When ticket was removed
        if (!selectedTicket && selectedTicketId && !isEmpty(tickets)) {
            handleSelectFirstInOrderTicket();
        }
    }, [selectedTicket, selectedTicketId, tickets])

    const isRevealButtonDisabled = (
        !!selectedTicket?.isRevealed
        || !selectedTicketId
        || !estimationsForTicket
        || !Object.keys(estimationsForTicket).length
    )

    return (
        <div className="estimation-page">
            <LogoHeader className="estimation-page-main-header" />

            <div className="cards-container">
                <div className="header-row">
                    <div className="header">
                        <span className="estimating-label">Estimating now:</span>
                        {loadingTickets
                            ? <SkeletonLoader className="skeleton-estimating-ticket" />
                            : (
                                <span className="estimating-ticket">
                                    {selectedTicket?.name}
                                </span>
                            )}
                    </div>

                    {(user.isAdmin || user.isSpectator) && (
                        <Button
                            className="reveal-estimation-button"
                            buttonSize="medium"
                            disabled={isRevealButtonDisabled}
                            onClick={() => selectedTicketId && dispatch(revealTicketEstimate(selectedTicketId))}
                        >
                            Reveal Cards
                        </Button>
                    )}
                </div>

                <EstimateCardsPreview className="cards-preview" reveal={selectedTicket?.isRevealed} />
            </div>

            <div className="side-container">
                <div className="sidebar-header">
                    {isCompleteUser(user) && (
                        <>
                            <UserProfile
                                changeUserType
                                user={user}
                                className="user-avatar"
                            />
                            <span className="username">{user.name}</span>
                        </>
                    )}

                    <Button className="share-button" buttonStyle="outline" onClick={handleCopyShareLink}>
                        Share game
                    </Button>
                </div>

                <div className="side-container-card">
                    <span className="side-container-card-header">Issues:</span>
                    <TicketManager className="ticket-manager" />
                </div>
            </div>

            {selectedTicket?.isRevealed && (
                <EstimationResults className="estimation-results" />
            )}

            {!user.isSpectator && !selectedTicket?.isRevealed && (
                <EstimateCardPicker className="card-picker" />
            )}
        </div>
    )
}
