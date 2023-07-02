import ClassName from 'classnames';
import { useMemo } from 'react';

import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { getUsersByTeam } from '../../utils/users';
import { countEstimations, getEstimationMedians, getEstimationSum } from '../../utils/estimations';
import { EstimationResultItem } from './EstimationResultItem';
import { Button } from '../Button';

import './EstimationResults.scss';
import { setSelectedTicket, setSelectedTicketForEveryone } from '../../store/actions/estimation/tickets';

type EstimationResultProps = {
    className?: string;
}

export const EstimationResults = ({ className }: EstimationResultProps) => {
    const dispatch = useTypedDispatch();

    const user = useTypedSelector((state) => state.user);
    const { data: tickets, selectedTicketId } = useTypedSelector((state) => state.estimation.tickets);
    const { data: session } = useTypedSelector((state) => state.estimation.session);
    const { data: users } = useTypedSelector((state) => state.estimation.users);
    const { data: estimations } = useTypedSelector((state) => state.estimation.estimations);

    const ticketEstimations = selectedTicketId ? estimations[selectedTicketId] : undefined;

    const estimationMedians = useMemo(() => {
        if (!ticketEstimations) return;

        const usersByTeam = getUsersByTeam(Object.values(users));
        const countedEstimations = countEstimations(ticketEstimations, usersByTeam);

        return getEstimationMedians(countedEstimations);
    }, [users, ticketEstimations])

    const estimatesSum = useMemo(() => {
        if (!session || !estimationMedians) return '';

        return getEstimationSum(estimationMedians, session.deck);
    }, [estimationMedians, session]);

    const handleSelectNextTicketForEstimationInOrder = () => {
        const sortedTickets = Object.values(tickets).sort((a, b) => a.order - b.order);
        const [nextTicket] = sortedTickets.filter((ticket) => !ticket.isRevealed);

        if (!nextTicket) return;

        if (user.isAdmin) {
            return dispatch(setSelectedTicketForEveryone(nextTicket.id));
        }

        dispatch(setSelectedTicket(nextTicket.id));
    };

    const fullClassName = ClassName('default-estimation-result', className);

    if (!estimationMedians) return null;

    return (
        <div className={fullClassName}>
            <div className="results">
                {Object.entries(estimationMedians).map(([teamName, median]) => (
                    <EstimationResultItem
                        key={teamName}
                        name={teamName}
                        additionalInfo="(median)"
                        value={median}
                    />
                ))}

                {Object.keys(estimationMedians).length > 1 && (
                    <EstimationResultItem
                        name="Sum"
                        value={estimatesSum}
                    />
                )}
            </div>

            <Button buttonSize="medium" onClick={handleSelectNextTicketForEstimationInOrder}>
                Estimate next issue
            </Button>
        </div>
    )
}
