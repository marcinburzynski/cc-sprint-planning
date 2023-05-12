import ClassName from 'classnames';

import './EstimationResultItem.scss';

type EstimationResultItemProps = {
    className?: string;
    name: string;
    additionalInfo?: string;
    value: string | undefined;
}

export const EstimationResultItem = ({ className, name, additionalInfo, value }: EstimationResultItemProps) => {
    const fullClassName = ClassName('default-estimation-result-item', className);

    return (
        <div className={fullClassName}>
            <div className="labels">
                <span className="name">
                    {name}
                </span>

                {additionalInfo && (
                    <span className="additional-info">
                        {additionalInfo}
                    </span>
                )}
            </div>
            <div className="value">
                {value || '?'}
            </div>
        </div>
    )
}
