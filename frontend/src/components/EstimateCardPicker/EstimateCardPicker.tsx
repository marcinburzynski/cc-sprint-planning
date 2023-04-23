import ClassName from 'classnames';
import { useState } from 'react';

import { EstimateCard, EstimateCardMode } from '../EstimateCard';

import { ReactComponent as EyeOpenIconSVG } from '../../assets/icons/eye-open.svg';
import { ReactComponent as EyeClosedIconSVG } from '../../assets/icons/eye-closed.svg';

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
    const [isVisible, setIsVisible] = useState(true);

    const handlePickCard = (selection: string) => {
        if (freeze) return;

        if (selection === selectedCard) {
            return onChangeSelection(undefined)
        }

        onChangeSelection(selection);
    }

    const fullClassName = ClassName('default-est-card-picker', className, {
        'default-est-card-picker--hidden': !isVisible,
    });

    if (!cardsSet) return null;

    return (
        <div className={fullClassName}>
            {isVisible
                ? <EyeOpenIconSVG className="hide-icon" onClick={() => setIsVisible(false)} />
                : <EyeClosedIconSVG className="hide-icon" onClick={() => setIsVisible(true)} />}
            {cardsSet.map((card) => (
                <EstimateCard
                    key={card}
                    className="estimate-card"
                    value={card}
                    onClick={handlePickCard}
                    mode={selectedCard === card ? EstimateCardMode.FrontSideSelected : EstimateCardMode.FrontSideNotSelected}
                />
            ))}
        </div>
    )
}
