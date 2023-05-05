import ClassName from 'classnames';
import { MouseEventHandler } from 'react';

import { Spinner } from '../Spinner';

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
    loading?: boolean;
}

export const Button = ({
    className,
    disabled,
    onClick,
    buttonStyle = 'filled',
    buttonSize = 'small',
    loading,
    children,
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
            'default-button--loading': loading,
        }
    );

    return (
        <button onClick={handleClick} disabled={disabled} className={fullClassName} {...props}>
            {typeof children === 'string' ? (
                <span>{children}</span>
            ) : (
                children
            )}

            {loading && (
                <div className="default-button-loader-container">
                    <Spinner />
                </div>
            )}
        </button>
    )
}
