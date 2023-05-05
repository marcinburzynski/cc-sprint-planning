import ClassName from 'classnames';
import { MouseEventHandler } from 'react';

import './Button.scss';

type ButtonStyle =
    | 'filled'
    | 'outline'

type ButtonSize =
    | 'small'
    | 'medium'

type ButtonProps = JSX.IntrinsicElements['button'] & {
    buttonStyle?: ButtonStyle;
    buttonSize?: ButtonSize;
}

export const Button = ({
    className,
    disabled,
    onClick,
    buttonStyle = 'filled',
    buttonSize = 'small',
    ...props
}: ButtonProps) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (disabled) return;

        onClick?.(e);
    }

    const fullClassName = ClassName(
        'default-button',
        `default-button--${buttonStyle}`,
        `default-button--${buttonSize}`,
        className,
        {
            'default-button--disabled': disabled,
        }
    );

    return (
        <button onClick={handleClick} disabled={disabled} className={fullClassName} {...props} />
    )
}
