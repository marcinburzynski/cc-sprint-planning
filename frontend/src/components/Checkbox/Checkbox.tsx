import ClassName from 'classnames';

import { ReactComponent as CheckboxCheckedIconSVG } from '../../assets/icons/checkbox-checked.svg'
import { ReactComponent as CheckboxUncheckedIconSVG } from '../../assets/icons/checkbox-unchecked.svg'

import './Checkbox.scss';

type CheckboxProps = {
    className?: string;
    isChecked: boolean;
    onChange: (newState: boolean) => void;
}

export const Checkbox = ({ className, isChecked, onChange }: CheckboxProps) => {
    const fullClassName = ClassName('default-checkbox', className);

    const handleClickCheckbox = () => {
        onChange(!isChecked);
    }

    return (
        <>
            {isChecked ? (
                <CheckboxCheckedIconSVG
                    className={fullClassName}
                    onClick={handleClickCheckbox}
                />
            ) : (
                <CheckboxUncheckedIconSVG
                    className={fullClassName}
                    onClick={handleClickCheckbox}
                />
            )}

            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onChange(e.target.checked)}
                className="hidden-accessibility-checkbox"
            />
        </>
    )
}
