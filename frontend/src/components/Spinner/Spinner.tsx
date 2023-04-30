import ClassName from 'classnames';

import { ReactComponent as LoaderIconSVG } from '../../assets/icons/loader.svg';

import './Spinner.scss';

type SpinnerProps = JSX.IntrinsicElements['svg']

export const Spinner = ({ className, ...props }: SpinnerProps) => {
    const fullClassName = ClassName('default-spinning-loader', className);

    return <LoaderIconSVG {...props} className={fullClassName} />;
}
