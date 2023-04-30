import ClassName from 'classnames';
import { MouseEventHandler } from 'react';

import './Button.scss';

export const Button = ({ className, disabled, onClick, ...props }: JSX.IntrinsicElements['button']) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (disabled) return;

        onClick?.(e);
    }

    const fullClassName = ClassName('default-button', className, {
        'default-button--disabled': disabled,
    })

    return (
        <button onClick={handleClick} disabled={disabled} className={fullClassName} {...props} />
    )
}
