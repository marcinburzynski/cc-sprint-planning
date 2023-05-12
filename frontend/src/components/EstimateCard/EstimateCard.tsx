import ClassName from 'classnames';

import type { EstimateCardType } from '../../types/commonTypes';

import './EstimateCard.scss';

type EstimateCardProps = {
    className?: string;
    isSelected?: boolean;
    isRevealed?: boolean;
    card?: EstimateCardType;
    onClick?: (value: string) => void;
}

export const EstimateCard = ({
    className,
    isSelected,
    isRevealed,
    card,
    onClick,
}: EstimateCardProps) => {
    const fullClassName = ClassName('default-card', className, {
        'default-card--selected': isSelected,
        'default-card--revealed': isRevealed,
    })

    return (
        <div className={fullClassName} onClick={() => onClick?.(card?.label || '')}>
            {isRevealed ? card?.label || '-' : null}
        </div>
    )
}
