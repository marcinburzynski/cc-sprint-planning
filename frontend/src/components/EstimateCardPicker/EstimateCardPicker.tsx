import ClassName from 'classnames';

import { EstimateCard } from '../EstimateCard';

import type { EstimateCardType } from '../../types/commonTypes';

import './EstimateCardPicker.scss';

type EstimateCardPickerProps = {
    className?: string;
    selectedCard?: string | null
    deck: EstimateCardType[];
    freeze?: boolean;
    onChangeSelection: (selectedCard?: string) => void;
}

export const EstimateCardPicker = ({
    className,
    selectedCard,
    deck,
    freeze,
    onChangeSelection,
}: EstimateCardPickerProps) => {
    const handlePickCard = (selection: string) => {
        if (freeze) return;

        if (selection === selectedCard) {
            return onChangeSelection(undefined)
        }

        onChangeSelection(selection);
    }

    const fullClassName = ClassName('default-est-card-picker', className);

    return (
        <div className={fullClassName}>
            {deck.map((card) => (
                <EstimateCard
                    isRevealed
                    key={card.label}
                    isSelected={selectedCard === card.label}
                    card={card}
                    className="estimate-card"
                    onClick={handlePickCard}
                />
            ))}
        </div>
    )
}
