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
        setIsVisible(true);
    }

    const handleHide = (e: MouseEvent) => {
        setIsVisible(false);
    }

    if (!triggerButton || !children) return null;

    return (
        <>
            {cloneElement(triggerButton, { onClick: triggerButton.props.onClick || handleShow })}

            {isVisible && (
                <Modal className={modalClassName} onHide={handleHide} header={header}>
                    {children}
                </Modal>
            )}
        </>
    )
}
