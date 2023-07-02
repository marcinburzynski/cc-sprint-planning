import ClassName from 'classnames';

import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { sendEstimation } from '../../store/actions/estimation/estimations';
import { EstimateCard } from '../EstimateCard';
import { isCompleteUser } from '../../types/typePredicates';

import './EstimateCardPicker.scss';

type EstimateCardPickerProps = {
    className?: string;
}

export const EstimateCardPicker = ({ className }: EstimateCardPickerProps) => {
    const dispatch = useTypedDispatch();

    const user = useTypedSelector((state) => state.user);
    const selectedTicketId = useTypedSelector((state) => state.estimation.tickets.selectedTicketId);
    const { data: estimations } = useTypedSelector((state) => state.estimation.estimations);
    const { data: session } = useTypedSelector((state) => state.estimation.session);

    if (!selectedTicketId || !session || !isCompleteUser(user)) return null;

    const userEstimate = estimations?.[selectedTicketId]?.[user.id];

    const handlePickCard = (selection: string) => {
        if (selection === userEstimate) {
            return dispatch(sendEstimation(selectedTicketId, undefined));
        }

        dispatch(sendEstimation(selectedTicketId, selection));
    }

    const fullClassName = ClassName('default-est-card-picker', className);

    return (
        <div className={fullClassName}>
            {session.deck.map((card) => (
                <EstimateCard
                    isRevealed
                    className="estimate-card"
                    key={card.label}
                    card={card}
                    onClick={handlePickCard}
                    isSelected={userEstimate === card.label}
                />
            ))}
        </div>
    )
}
