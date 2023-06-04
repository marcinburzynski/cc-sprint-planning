import { ReactElement } from 'react';
import ClassName from 'classnames';
import {
    Root,
    Trigger,
    Portal,
    Content,
    type PopoverContentProps,
} from '@radix-ui/react-popover';

import './Popup.scss';

type PopupProps = Omit<PopoverContentProps, 'className'> & {
    triggerClassName?: string;
    dropdownClassName?: string;
    dropdownButton: JSX.Element;
    children: JSX.Element | (JSX.Element | undefined | null | string | false)[];
}

export const Popup = ({
    triggerClassName,
    dropdownClassName,
    dropdownButton,
    children,
    ...contentProps
}: PopupProps) => {
    const triggerFullClassName = ClassName('default-popup-trigger', triggerClassName);
    const dropdownFullClassName = ClassName('default-popup-dropdown', dropdownClassName);

    return (
        <Root>
            <Trigger className={triggerFullClassName}>
                {dropdownButton}
            </Trigger>

            <Portal>
                <Content {...contentProps} className={dropdownFullClassName}>
                    {children}
                </Content>
            </Portal>
        </Root>
    )
}
