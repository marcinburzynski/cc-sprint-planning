import ClassName from 'classnames';

import './TextArea.scss';

type InputProps = Omit<JSX.IntrinsicElements['textarea'], 'onChange'> & {
    onChange: (value: string) => void;
}

export const TextArea = ({ className, onChange, ...props }: InputProps) => {
    const handleChange: JSX.IntrinsicElements['textarea']['onChange'] = (e) => onChange(e.target.value);

    const fullClassName = ClassName('default-textarea', className)

    return (
        <textarea className={fullClassName} onChange={handleChange} {...props} />
    )
}
