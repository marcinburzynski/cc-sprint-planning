import { useState, MouseEventHandler } from 'react';
import ClassName from 'classnames';

import { Button } from '../Button';
import { ModalWithButton } from '../Modal';

import './ConfirmationModal.scss';


type ConfirmationModalProps = {
    className?: string;
    title?: string;
    message?: string;
    content?: JSX.Element;
    dangerous?: boolean;
    acceptLabel?: string;
    cancelLabel?: string;
    children?: JSX.Element;
    onAccept?: MouseEventHandler<HTMLButtonElement>;
    onCancel?: MouseEventHandler<HTMLButtonElement>;
}

export const ConfirmationModal = ({
    className,
    title,
    message,
    content,
    dangerous,
    acceptLabel = 'Accept',
    cancelLabel = 'Cancel',
    children,
    onAccept,
    onCancel,
}: ConfirmationModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
        setIsVisible(false);
        onCancel?.(e);
    }

    const handleAccept: MouseEventHandler<HTMLButtonElement> = (e) => {
        setIsVisible(false);
        onAccept?.(e);
    }

    const headerContent = (
        <span className="default-confirmation-modal-header">{title}</span>
    )

    const fullClassName = ClassName('default-confirmation-modal', className, {
        'default-confirmation-modal--dangerous': dangerous,
    });

    return (
        <ModalWithButton
            modalClassName={fullClassName}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            triggerButton={children}
            header={headerContent}
        >
            <div className="default-confirmation-modal-content">
                {content ? (
                    content
                ) : (
                    <span className="default-confirmation-modal-message">{message}</span>
                )}

                <div className="default-confirmation-modal-footer">
                    <Button className="cancel-button" onClick={handleCancel}>
                        {cancelLabel}
                    </Button>

                    <Button className="accept-button" onClick={handleAccept}>
                        {acceptLabel}
                    </Button>
                </div>
            </div>
        </ModalWithButton>
    )
}
