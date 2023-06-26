import ClassName from 'classnames';
import { useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'

import { useTypedSelector, useTypedDispatch } from '../../../store/hooks';
import { jira } from '../../../services/jira';
import { getUsersByTeam } from '../../../utils/users';
import {
    setSelectedTicket,
    setSelectedTicketForEveryone,
    restartTicketEstimation,
    removeTicket,
} from '../../../store/actions/estimation/tickets';
import { countEstimations, getEstimationMedians, getEstimationSum } from '../../../utils/estimations';
import { isJiraTicket } from '../../../types/typePredicates';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { DetachedConfirmationModal } from '../../ConfirmationModal';
import { SaveEstimateToJiraModal } from '../../SaveEstimateToJiraModal';
import { IssueDetailsModal } from '../../IssueDetailsModal';

import { ReactComponent as JiraLinkIconSVG } from '../../../assets/icons/jira-link.svg';

import type { TicketType } from '../../../types/commonTypes';

import './TicketItem.scss';

type TicketItemProps = {
    className?: string;
    ticket: TicketType;
    isSelected: boolean;
}

export const TicketItem = ({ className, ticket, isSelected }: TicketItemProps) => {
    const dispatch = useTypedDispatch();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ticket.id });

    const [isConfirmRemoveVisible, setIsConfirmRemoveVisible] = useState(false);
    const [isSaveEstimateToJiraVisible, setIsSaveEstimateToJiraVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

    const user = useTypedSelector((state) => state.user);
    const { data: session } = useTypedSelector((state) => state.estimation.session);
    const { data: users } = useTypedSelector((state) => state.estimation.users);
    const { data: estimations } = useTypedSelector((state) => state.estimation.estimations);

    const ticketEstimations = estimations[ticket.id];

    const handleGoToTicket = () => {
        window.open(ticket.issueUrl, '_blank');
    };

    const handleRestartEstimation = () => {
        const shouldRestart = window.confirm('Are you sure you want to restart estimation?');

        if (!shouldRestart) return;

        dispatch(restartTicketEstimation(ticket.id));
    }

    const handleRemoveTicket = () => {
        setIsConfirmRemoveVisible(false);
        dispatch(removeTicket(ticket.id));
    }

    const getEstimationStatusLabel = () => {
        if (ticket.isRevealed) {
            if (user.isAdmin) {
                return 'Estimate again';
            }

            return 'Estimated';
        }

        if (ticketEstimations) {
            return 'Estimating';
        }

        return 'Estimate';
    }

    const usersByTeam = useMemo(() => getUsersByTeam(Object.values(users)), [users]);

    const estimate = useMemo(() => {
        if (!ticketEstimations || !ticket.isRevealed || !session) return;

        return getEstimationSum(getEstimationMedians(countEstimations(ticketEstimations, usersByTeam)), session.deck);
    }, [usersByTeam, ticketEstimations, session, ticket])

    const fullClassName = ClassName('default-ticket-item', className, {
        'default-ticket-item--selected': isSelected,
    });

    const estimationStatusFullClassName = ClassName('estimation-status', {
        'estimation-status--clickable': ticket.isRevealed && user.isAdmin,
    })

    const draggableStyle = {
        transition,
        transform: CSS.Transform.toString(transform),
        cursor: isDragging ? 'grabbing' : undefined,
        zIndex: isDragging ? 1000 : undefined,
    };

    return (
        <div
            className={fullClassName}
            style={draggableStyle}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={() => dispatch(setSelectedTicket(ticket.id))}
        >
            <div className="ticket-description">
                <div className="ticket-name-container" >
                    {ticket.issueUrl && (
                        <JiraLinkIconSVG onClick={handleGoToTicket} />
                    )}
                    <span className="ticket-name">{ticket.name}</span>
                </div>

                <span
                    className={estimationStatusFullClassName}
                    onClick={ticket.isRevealed && user.isAdmin ? handleRestartEstimation : undefined}
                >
                    {getEstimationStatusLabel()}
                </span>
            </div>

            {estimate && (
                <div className="estimate-sum-display">
                    {estimate}
                </div>
            )}

            <Dropdown
                stopPropagation
                hideIfEmpty
                triggerClassName="kebab-menu"
                align="end"
            >
                <DropdownItem onClick={() => setIsDetailsModalVisible(true)} hidden={!ticket.issueKey}>
                    Issue details
                </DropdownItem>

                <DropdownItem
                    onClick={() => setIsSaveEstimateToJiraVisible(true)}
                    hidden={!isJiraTicket(ticket) || !estimate || !user.isAdmin}
                >
                    Save estimate to Jira
                </DropdownItem>

                <DropdownItem
                    onClick={() => dispatch(setSelectedTicketForEveryone(ticket.id))}
                    hidden={!user.isAdmin}
                >
                    Select ticket for everyone
                </DropdownItem>

                <DropdownItem onClick={handleRestartEstimation} hidden={!ticket.isRevealed || !user.isAdmin}>
                    Restart estimation
                </DropdownItem>

                <DropdownItem onClick={() => setIsConfirmRemoveVisible(true)} hidden={!user.isAdmin}>
                    Remove
                </DropdownItem>
            </Dropdown>

            {isConfirmRemoveVisible && (
                <DetachedConfirmationModal
                    dangerous
                    stopPropagation
                    title="Are you sure?"
                    message={'This action will remove ticket from the estimation. \nAll changes will be lost. \nIt will not affect Jira tickets.'}
                    onAccept={handleRemoveTicket}
                    onCancel={() => setIsConfirmRemoveVisible(false)}
                />
            )}

            {isSaveEstimateToJiraVisible && isJiraTicket(ticket) && estimate && session && (
                <SaveEstimateToJiraModal
                    ticket={ticket}
                    deck={session.deck}
                    initialEstimation={estimate}
                    onHideModal={() => setIsSaveEstimateToJiraVisible(false)}
                />
            )}

            {isDetailsModalVisible && isJiraTicket(ticket) && (
                <IssueDetailsModal issueKey={ticket.issueKey} onHide={() => setIsDetailsModalVisible(false)} />
            )}
        </div>
    )
}
