import { MutableRefObject } from 'react';

import ClassName from 'classnames';

import './Input.scss';

type InputProps = Omit<JSX.IntrinsicElements['input'], 'onChange' | 'ref'> & {
    onChange: (value: string) => void;
    inputRef?: MutableRefObject<HTMLInputElement | null>;
}

export const Input = ({ className, onChange, inputRef, ...props }: InputProps) => {
    const handleChange: JSX.IntrinsicElements['input']['onChange'] = (e) => onChange(e.target.value);

    const fullClassName = ClassName('default-input', className)

    return (
        <input className={fullClassName} onChange={handleChange} ref={inputRef} {...props} />
    )
}
