import ClassName from 'classnames';
import { cloneElement, Children, MouseEvent } from 'react';
import {
    Root,
    Trigger,
    Portal,
    Content,
    Item,
    Separator,
    MenuItemProps,
    MenuContentProps,
    MenuSeparatorProps,
} from '@radix-ui/react-dropdown-menu';


import { ReactComponent as KebabMenuIconSVG } from '../../assets/icons/kebab-menu.svg';

import './Dropdown.scss';

type DropdownProps = Pick<MenuContentProps, 'align' | 'side' | 'alignOffset' | 'sideOffset'> & {
    triggerClassName?: string;
    contentClassName?: string;
    triggerButton?: JSX.Element;
    hideIfEmpty?: boolean;
    children: JSX.Element | JSX.Element[];
    stopPropagation?: boolean;
}

export const Dropdown = ({
    triggerClassName,
    contentClassName,
    sideOffset,
    alignOffset,
    side = 'bottom',
    align,
    triggerButton = <KebabMenuIconSVG />,
    hideIfEmpty,
    children,
    stopPropagation,
}: DropdownProps) => {

    if (hideIfEmpty) {
        if (Array.isArray(children) && children.every((child) => child.props.hidden)) {
            return null
        }

        if (!Array.isArray(children) && children.props.hidden) {
            return null;
        }
    }

    const triggerFullClassName = ClassName('default-dropdown-trigger-button', triggerClassName);
    const contentFullClassName = ClassName('default-dropdown-content', contentClassName);

    return (
        <Root>
            <Trigger className={triggerFullClassName}>
                {triggerButton}
            </Trigger>

            <Portal>
                <Content
                    className={contentFullClassName}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                    side={side}
                    align={align}
                >
                    {Children.map(children, (child) => cloneElement(child, { stopPropagation }))}
                </Content>
            </Portal>
        </Root>
    )
}

type DropdownItemProps = MenuItemProps & {
    stopPropagation?: boolean;
}

export const DropdownItem = ({ className, onClick, stopPropagation, ...props }: DropdownItemProps) => {
    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (stopPropagation) {
            e.stopPropagation();
        }

        onClick?.(e)
    }

    const fullClassName = ClassName('default-dropdown-item', className);

    return <Item className={fullClassName} onClick={handleClick} {...props} />
}

export const DropdownSeparator = ({ className, ...props }: MenuSeparatorProps) => {
    const fullClassName = ClassName('default-dropdown-separator', className);

    return <Separator className={fullClassName} {...props} />
}
