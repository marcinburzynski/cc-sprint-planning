import ClassName from 'classnames';
import { useMemo, useState } from 'react';

import { useTypedSelector } from '../../../store/hooks';
import { getUsersByTeam } from '../../../utils/users';
import { countEstimations, getEstimationMedians, getEstimationSum } from '../../../utils/estimations';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { DetachedConfirmationModal } from '../../ConfirmationModal';

import type { StoredEstimations } from '../../../store/reducers/estimation/estimations';
import type { TicketType, UserType } from '../../../types/commonTypes';

import './TicketItem.scss';

type TicketItemProps = {
    className?: string;
    users: UserType[];
    ticketEstimations: StoredEstimations[string];
    ticket: TicketType;
    isSelected: boolean;
    onClick: (ticket: TicketType) => void;
    onRestartEstimation: (ticketId: string) => void;
    onRemove: (ticketId: string) => void;
}

export const TicketItem = ({
    className,
    users,
    ticketEstimations,
    ticket,
    isSelected,
    onClick,
    onRestartEstimation,
    onRemove,
}: TicketItemProps) => {
    const [isConfirmRemoveVisible, setIsConfirmRemoveVisible] = useState(false);

    const user = useTypedSelector((state) => state.user);

    const handleGoToTicket = () => {
        window.open(`https://shareablee.atlassian.net/browse/${ticket.issueKey}`, '_blank');
    };

    const handleRestartEstimation = () => {
        const shouldRestart = window.confirm('Are you sure you want to restart estimation?');

        if (!shouldRestart) return;

        onRestartEstimation(ticket.id);
    }

    const handleRemoveTicket = () => {
        setIsConfirmRemoveVisible(false);
        onRemove(ticket.id);
    }

    const getEstimationStatusLabel = () => {
        if (ticket.isRevealed) {
            return 'Estimate again';
        }

        if (ticketEstimations) {
            return 'Estimating';
        }

        return 'Estimate';
    }

    const usersByTeam = useMemo(() => getUsersByTeam(users), [users]);

    const estimate = useMemo(() => {
        if (!ticketEstimations || !ticket.isRevealed) return;

        return getEstimationSum(getEstimationMedians(countEstimations(ticketEstimations, usersByTeam)));
    }, [usersByTeam, ticketEstimations])

    const fullClassName = ClassName('default-ticket-item', className, {
        'default-ticket-item--selected': isSelected,
    });

    const estimationStatusFullClassName = ClassName('estimation-status', {
        'estimation-status--clickable': ticket.isRevealed,
    })

    return (
        <div className={fullClassName} onClick={() => onClick(ticket)}>
            <div className="ticket-description">
                <span className="ticket-name">{ticket.name}</span>

                <span
                    className={estimationStatusFullClassName}
                    onClick={ticket.isRevealed ? handleRestartEstimation : undefined}
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
                triggerClassName="kebab-menu"
                align="end"
            >
                <DropdownItem onClick={handleGoToTicket} hidden={!ticket.issueKey}>
                    Open in Jira
                </DropdownItem>

                <DropdownItem onClick={handleRestartEstimation} hidden={!ticket.isRevealed || !user.isSpectator}>
                    Restart estimation
                </DropdownItem>

                <DropdownItem onClick={() => setIsConfirmRemoveVisible(true)} hidden={!user.isSpectator}>
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
        </div>
    )
}
