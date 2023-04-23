import ClassName from 'classnames';

import { ReactComponent as ComscoreLogoSVG } from '../../assets/icons/comscore.svg';
import { ReactComponent as ComscoreLogoHollowSVG } from '../../assets/icons/comscore-hollow.svg';

import './EstimateCard.scss';

export enum EstimateCardMode {
    BackSideNotSelected,
    BackSideSelected,
    FrontSideNotSelected,
    FrontSideSelected,
}

type EstimateCardProps = {
    className?: string;
    mode: EstimateCardMode;
    value?: string;
    onClick?: (value: string) => void;
}

export const EstimateCard = ({ className, mode, value, onClick }: EstimateCardProps) => {
    const partialClassName = ClassName('default-card-container', className)

    switch (mode) {
        case EstimateCardMode.BackSideNotSelected: {
            const fullClassName = ClassName(partialClassName, 'default-card-container--back-side-not-selected')

            return (
                <div className={fullClassName}>
                    <ComscoreLogoHollowSVG />
                </div>
            )
        }

        case EstimateCardMode.BackSideSelected: {
            const fullClassName = ClassName(partialClassName, 'default-card-container--back-side-selected');

            return (
                <div className={fullClassName}>
                    <ComscoreLogoSVG />
                </div>
            );
        }

        case EstimateCardMode.FrontSideNotSelected:
        case EstimateCardMode.FrontSideSelected: {
            const fullClassName = ClassName(partialClassName, {
                'default-card-container--front-side-not-selected': mode === EstimateCardMode.FrontSideNotSelected,
                'default-card-container--front-side-selected': mode === EstimateCardMode.FrontSideSelected,
            });

            return (
                <div className={fullClassName} onClick={() => onClick?.(value || '-')}>
                    <ComscoreLogoSVG className="logo logo--top-left" />

                    <div className="score-circle">
                        <span>{value || '-'}</span>
                    </div>

                    <ComscoreLogoSVG className="logo logo--bottom-right" />
                </div>
            );
        }
    }
}
