import ClassName from 'classnames';
import { useRef, useEffect } from 'react';

import { useKeyEvent } from '../../hooks';

import { ReactComponent as CheckboxCheckedIconSVG } from '../../assets/icons/checkbox-checked.svg'
import { ReactComponent as CheckboxUncheckedIconSVG } from '../../assets/icons/checkbox-unchecked.svg'

import './Checkbox.scss';

type CheckboxProps = {
    className?: string;
    isChecked: boolean;
    onChange?: (newState: boolean) => void;
}

export const Checkbox = ({ className, isChecked, onChange }: CheckboxProps) => {
    const checkboxRef = useRef<SVGSVGElement>(null)
    const shouldRefocus = useRef(false);

    useEffect(() => {
        if (shouldRefocus.current) {
            checkboxRef.current?.focus()
            shouldRefocus.current = false;
        }
    }, [checkboxRef.current, shouldRefocus.current])

    const handleClickCheckbox = () => {
        onChange?.(!isChecked);
    }

    const handleSpacePressed = (e: KeyboardEvent) => {
        if (e.target !== checkboxRef.current) return;
        handleClickCheckbox();
        shouldRefocus.current = true;
    }

    useKeyEvent(' ', handleSpacePressed)

    const fullClassName = ClassName('default-checkbox', className);

    return (
        <>
            {isChecked ? (
                <CheckboxCheckedIconSVG
                    role="checkbox"
                    aria-checked="true"
                    tabIndex={0}
                    className={fullClassName}
                    onClick={handleClickCheckbox}
                    ref={checkboxRef}
                />
            ) : (
                <CheckboxUncheckedIconSVG
                    role="checkbox"
                    aria-checked="false"
                    tabIndex={0}
                    className={fullClassName}
                    onClick={handleClickCheckbox}
                    ref={checkboxRef}
                />
            )}
        </>
    )
}
