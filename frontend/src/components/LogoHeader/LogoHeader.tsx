import ClassName from 'classnames';

import { ReactComponent as LogoIconSVG } from '../../assets/icons/planning-logo.svg';

import './LogoHeader.scss';

type LogoHeaderProps = {
    className?: string;
}

export const LogoHeader = ({ className }: LogoHeaderProps) => {
    const fullClassName = ClassName('default-logo-header', className);

    return (
        <div className={fullClassName}>
            <LogoIconSVG />

            <span>Sprint planning</span>
        </div>
    )
}
