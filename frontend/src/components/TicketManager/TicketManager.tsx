import ClassName from 'classnames';
import { useMemo } from 'react';

import { TicketItem } from './TicketItem';
import { AddTicket } from './AddTicket';

import type { StoredEstimations } from '../../store/reducers/estimation/estimations';
import type { TicketType, UserType } from '../../types/commonTypes';

import './TicketManager.scss';

type TicketManagerSidebarProps = {
    className?: string;
    estimations: StoredEstimations;
    users: UserType[];
    tickets: TicketType[];
    selectedTicket: TicketType | undefined;
    isSpectator?: boolean;
    onSelectTicket: (ticket: TicketType) => void;
    onAddTicket: (name: string) => void;
    onRemoveTicket: (ticketId: string) => void;
    onRestartEstimation: (ticketId: string) => void;
}

export const TicketManager = ({
    className,
    estimations,
    users,
    tickets,
    selectedTicket,
    isSpectator,
    onSelectTicket,
    onAddTicket,
    onRemoveTicket,
    onRestartEstimation,
}: TicketManagerSidebarProps) => {
    const sortedTickets = useMemo(() => {
        const clonedTickets = [...tickets];
        return clonedTickets.sort((a, b) => a.order - b.order);
    }, [tickets])

    const fullClassName = ClassName('default-ticket-manager', className);

    return (
        <div className={fullClassName}>
            <div className="tickets-list">
                {sortedTickets.map((ticket) => (
                    <TicketItem
                        key={ticket.id}
                        className="ticket-item"
                        ticket={ticket}
                        users={users}
                        ticketEstimations={estimations[ticket.id]}
                        isSelected={ticket.id === selectedTicket?.id}
                        onClick={onSelectTicket}
                        onRestartEstimation={onRestartEstimation}
                        onRemove={onRemoveTicket}
                    />
                ))}
            </div>

            {isSpectator && (
                <AddTicket
                    className="add-ticket"
                    onAddTicket={onAddTicket}
                />
            )}
        </div>
    )
}
