import ClassName from 'classnames';
import { useRef, MouseEventHandler } from 'react';

import { Portal } from '../Portal';

import { ReactComponent as CrossIconSVG } from '../../assets/icons/cross.svg';

import './Modal.scss';

type ModalProps = {
    className?: string;
    wrapperClassName?: string;
    children?: JSX.Element;
    header?: JSX.Element | string | null;
    onHide?: MouseEventHandler;
}

export const Modal = ({
    className,
    wrapperClassName,
    onHide,
    children,
    header,
}: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClickWrapper: MouseEventHandler<HTMLDivElement> = (e) => {
        if (e.target === e.currentTarget) {
            onHide?.(e);
        }
    }

    const fullWrapperClassName = ClassName('default-modal-wrapper', wrapperClassName);
    const fullClassName = ClassName('default-modal', className);

    return (
        <Portal>
            <div className={fullWrapperClassName} onClick={handleClickWrapper}>
                <div className={fullClassName} ref={modalRef}>
                    <div className="modal-header">
                        {header}
                        <CrossIconSVG className="modal-close-button" onClick={onHide} />
                    </div>
                    <div className="modal-content">
                        {children}
                    </div>
                </div>
            </div>
        </Portal>
    )
}
