import ClassName from 'classnames';
import { useState } from 'react';

import { EstimateCard } from '../EstimateCard';

import './EstimateCardPicker.scss';

type EstimateCardPickerProps = {
    className?: string;
    selectedCard?: string | null
    cardsSet?: string[];
    freeze?: boolean;
    onChangeSelection: (selectedCard?: string) => void;
}

const DEFAULT_CARDS_SET = ['1', '2', '3', '5', '8', '13', '?']

export const EstimateCardPicker = ({
    className,
    selectedCard,
    cardsSet = DEFAULT_CARDS_SET,
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

    if (!cardsSet) return null;

    return (
        <div className={fullClassName}>
            {cardsSet.map((card) => (
                <EstimateCard
                    isRevealed
                    isSelected={selectedCard === card}
                    key={card}
                    className="estimate-card"
                    value={card}
                    onClick={handlePickCard}
                />
            ))}
        </div>
    )
}
