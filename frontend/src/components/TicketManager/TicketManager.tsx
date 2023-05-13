import ClassName from 'classnames';
import { useMemo } from 'react';

import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { createTicket } from '../../store/actions/estimation/tickets';
import { TicketItem } from './TicketItem';
import { AddTicket } from './AddTicket';

import './TicketManager.scss';

type TicketManagerSidebarProps = {
    className?: string;
}

export const TicketManager = ({ className }: TicketManagerSidebarProps) => {
    const dispatch = useTypedDispatch();

    const user = useTypedSelector((state) => state.user);
    const { data: tickets, selectedTicketId } = useTypedSelector((state) => state.estimation.tickets);

    const sortedTickets = useMemo(() => {
        const clonedTickets = [...Object.values(tickets)];

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
                        isSelected={ticket.id === selectedTicketId}
                    />
                ))}
            </div>

            {user.isAdmin && (
                <AddTicket
                    className="add-ticket"
                    onAddTicket={(name) => dispatch(createTicket({ name }))}
                />
            )}
        </div>
    )
}
