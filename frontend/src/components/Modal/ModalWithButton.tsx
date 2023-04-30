import { cloneElement, MouseEvent } from 'react';

import { Modal } from './Modal';

type ModalWithButtonProps = {
    modalClassName?: string;
    triggerButton?: JSX.Element;
    children?: JSX.Element;
    isVisible?: boolean;
    setIsVisible: (isVisible: boolean) => void;
    header?: JSX.Element | string | null;
}

export const ModalWithButton = ({
    modalClassName,
    isVisible,
    setIsVisible,
    children,
    triggerButton,
    header,
}: ModalWithButtonProps) => {
    const handleShow = (e: MouseEvent) => {
        e.stopPropagation();
        setIsVisible(true);
    }

    const handleHide = (e: MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
    }

    if (!triggerButton || !children) return null;

    return (
        <>
            {cloneElement(triggerButton, { onClick: handleShow, ...triggerButton.props })}

            {isVisible && (
                <Modal className={modalClassName} onHide={handleHide} header={header}>
                    {children}
                </Modal>
            )}
        </>
    )
}
