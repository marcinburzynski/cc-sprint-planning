import ClassName from 'classnames';

import './Input.scss';

type InputProps = Omit<JSX.IntrinsicElements['input'], 'onChange'> & {
    onChange: (value: string) => void;
}

export const Input = ({ className, onChange, ...props }: InputProps) => {
    const handleChange: JSX.IntrinsicElements['input']['onChange'] = (e) => onChange(e.target.value);

    const fullClassName = ClassName('default-input', className)

    return (
        <input className={fullClassName} onChange={handleChange} {...props} />
    )
}
