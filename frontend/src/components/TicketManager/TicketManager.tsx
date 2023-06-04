import ClassName from 'classnames';
import { useMemo } from 'react';
import { range } from 'lodash';
import {
    useSensor,
    useSensors,
    PointerSensor,
    DndContext,
    type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { createTicket, setTicketsOrder } from '../../store/actions/estimation/tickets';
import { TicketItem, TicketItemSkeleton } from './TicketItem';
import { AddTicket } from './AddTicket';

import './TicketManager.scss';

type TicketManagerSidebarProps = {
    className?: string;
}

export const TicketManager = ({ className }: TicketManagerSidebarProps) => {
    const dispatch = useTypedDispatch();

    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 1 }})
    const sensors = useSensors(pointerSensor)

    const {
        data: tickets,
        loading: loadingTickets,
        selectedTicketId
    } = useTypedSelector((state) => state.estimation.tickets);

    const sortedTickets = useMemo(() => {
        const clonedTickets = [...Object.values(tickets)];

        return clonedTickets.sort((a, b) => a.order - b.order);
    }, [tickets]);

    const sortedTicketIds = useMemo(() => sortedTickets.map(({ id }) => id), [sortedTickets]);

    const handleDragTicketEnd = ({ active, over }: DragEndEvent) => {
        if (active.id === over?.id) return;

        const oldIndex = sortedTicketIds.indexOf(active.id as string);
        const newIndex = sortedTicketIds.indexOf(over?.id as string);

        const newTicketsOrder = arrayMove(sortedTicketIds, oldIndex, newIndex);

        dispatch(setTicketsOrder(newTicketsOrder));
    }

    const fullClassName = ClassName('default-ticket-manager', className);

    return (
        <div className={fullClassName}>
            <div className="tickets-list">
                {loadingTickets
                    ? range(0, 4).map((index) => (
                        <TicketItemSkeleton key={`${index}`} className="ticket-item" />
                    ))
                    : (
                        <DndContext sensors={sensors} onDragEnd={handleDragTicketEnd}>
                            <SortableContext items={sortedTicketIds}>
                                {sortedTickets.map((ticket) => (
                                    <TicketItem
                                        key={ticket.id}
                                        className="ticket-item"
                                        ticket={ticket}
                                        isSelected={ticket.id === selectedTicketId}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )
                }
            </div>

            <AddTicket
                className="add-ticket"
                onAddTicket={(name) => dispatch(createTicket({ name }))}
            />
        </div>
    )
}
