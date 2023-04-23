import ClassName from 'classnames';
import { useState } from 'react';

import { TextArea } from '../TextArea';

import type { TicketType } from '../../types/commonTypes';

import { ReactComponent as PlusIconSVG } from '../../assets/icons/plus.svg';

import './TicketManagerSidebar.scss';

type TicketManagerSidebarProps = {
    className?: string;
    tickets: TicketType[];
    selectedTicket: TicketType | undefined;
    onSelectTicket: (ticket: TicketType) => void;
    onAddTicket: (name: string) => void;
}

export const TicketManagerSidebar = ({
    className,
    tickets,
    selectedTicket,
    onSelectTicket,
    onAddTicket,
}: TicketManagerSidebarProps) => {
    const [newTicketName, setNewTicketName] = useState('');

    const handleAddNewTicket = () => {
        if (!newTicketName) return;

        onAddTicket(newTicketName);
        setNewTicketName('');
    }

    const fullClassName = ClassName('default-ticket-manager-sidebar', className);

    return (
        <div className={fullClassName}>
            <div className="tickets-list">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket)}
                        className={ClassName('ticket', { 'ticket--selected': ticket.id === selectedTicket?.id })}
                    >
                        <span>{ticket.name}</span>
                    </div>
                ))}
            </div>

            <div className="add-ticket-container">
                <TextArea value={newTicketName} onChange={setNewTicketName} />
                <PlusIconSVG onClick={handleAddNewTicket} />
            </div>
        </div>
    )
}
