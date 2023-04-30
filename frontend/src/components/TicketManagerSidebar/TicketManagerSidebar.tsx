import ClassName from 'classnames';
import { useState, useMemo, MouseEvent } from 'react';

import { TextArea } from '../TextArea';
import { AddJiraTicketModal } from '../AddJiraTicketModal';
import { ConfirmationModal } from '../ConfirmationModal';

import type { TicketType } from '../../types/commonTypes';

import { ReactComponent as PlusIconSVG } from '../../assets/icons/plus.svg';
import { ReactComponent as TrashBinIconSVG } from '../../assets/icons/trash-bin.svg';
import { ReactComponent as LinkIconSVG } from '../../assets/icons/link.svg';

import './TicketManagerSidebar.scss';

type TicketManagerSidebarProps = {
    className?: string;
    tickets: TicketType[];
    selectedTicket: TicketType | undefined;
    isSpectator?: boolean;
    onSelectTicket: (ticket: TicketType) => void;
    onAddTicket: (name: string) => void;
    onRemoveTicket: (ticketId: string) => void;
}

export const TicketManagerSidebar = ({
    className,
    tickets,
    selectedTicket,
    isSpectator,
    onSelectTicket,
    onAddTicket,
    onRemoveTicket,
}: TicketManagerSidebarProps) => {
    const [newTicketName, setNewTicketName] = useState('');

    const handleAddNewTicket = () => {
        if (!newTicketName) return;

        onAddTicket(newTicketName);
        setNewTicketName('');
    }

    const handleGoToTicket = (ticket: TicketType) => (e: MouseEvent<SVGElement>) => {
        e.stopPropagation();
        window.open(`https://shareablee.atlassian.net/browse/${ticket.issueKey}`, '_blank');
    }

    const handleRemoveTicket = (ticketId: string) => (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onRemoveTicket(ticketId)
    }

    const sortedTickets = useMemo(() => {
        const clonedTickets = [...tickets];
        return clonedTickets.sort((a, b) => a.order - b.order);
    }, [tickets])

    const fullClassName = ClassName('default-ticket-manager-sidebar', className);

    return (
        <div className={fullClassName}>
            <div className="tickets-list">
                {sortedTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket)}
                        className={ClassName('ticket', { 'ticket--selected': ticket.id === selectedTicket?.id })}
                    >
                        <span>{ticket.name}</span>
                        <div className="controls">
                            {ticket.issueKey && (
                                <LinkIconSVG className="ticket-link-icon" onClick={handleGoToTicket(ticket)} />
                            )}

                            <ConfirmationModal
                                dangerous
                                title="Are you sure?"
                                message="This action will remove the ticket from the estimation."
                                acceptLabel="Remove"
                                onCancel={(e) => e.stopPropagation()}
                                onAccept={handleRemoveTicket(ticket.id)}
                            >
                                <TrashBinIconSVG className="remove-ticket-icon" />
                            </ConfirmationModal>
                        </div>
                    </div>
                ))}
            </div>

            {isSpectator && (
                <div className="add-ticket-container">
                    <TextArea value={newTicketName} onChange={setNewTicketName} />
                    <PlusIconSVG onClick={handleAddNewTicket} />
                </div>
            )}

            {isSpectator && (
                <AddJiraTicketModal buttonClassName="default-ticket-manager-sidebar__add-jira-ticket-button" />
            )}
        </div>
    )
}
