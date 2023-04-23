import ClassName from 'classnames';

import './Button.scss';

export const Button = ({ className, ...props }: JSX.IntrinsicElements['button']) => {
    const fullClassName = ClassName('default-button', className)

    return (
        <button className={fullClassName} {...props} />
    )
}
