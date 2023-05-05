import ClassName from 'classnames';

import './EstimateCard.scss';

type EstimateCardProps = {
    className?: string;
    isSelected?: boolean;
    isRevealed?: boolean;
    value?: string | null;
    onClick?: (value: string) => void;
}

export const EstimateCard = ({
    className,
    isSelected,
    isRevealed,
    value,
    onClick,
}: EstimateCardProps) => {
    const fullClassName = ClassName('default-card', className, {
        'default-card--selected': isSelected,
        'default-card--revealed': isRevealed,
    })

    return (
        <div className={fullClassName} onClick={() => onClick?.(value || '-')}>
            {isRevealed ? value || '-' : null}
        </div>
    )
}
