import { useState } from 'react';

import { useTypedSelector } from '../../store/hooks';
import { ConfirmationModal } from '../ConfirmationModal';
import { Input } from '../Input';

type SaveEstimationModalProps = {
    children?: JSX.Element;
    selectedTicketId: string;
}

export const SaveEstimationModal = ({ children, selectedTicketId }: SaveEstimationModalProps) => {
    const [estimation, setEstimation] = useState('');

    const {
        data: tickets,
        loading: loadingTickets,
    } = useTypedSelector((state) => state.estimation.tickets);

    const {
        data: estimations,
        loading: loadingEstimations,
    } = useTypedSelector((state) => state.estimation.estimations);

    const selectedTicket = tickets[selectedTicketId];
    const ticketEstimations = estimations[selectedTicketId];

    const content = (
        <div className="save-estimation-modal-content">
            <Input value={estimation} onChange={setEstimation} />
        </div>
    )

    return (
        <ConfirmationModal
            className="save-estimation-modal"
            title="Save estimation to JIRA"
            content={content}
        >
            {children}
        </ConfirmationModal>
    )
}
