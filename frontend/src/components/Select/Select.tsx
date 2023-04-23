import ClassName from 'classnames'
import { useRef } from 'react';
import { Root, Trigger, Value, Icon, Portal, Content, Viewport, SelectItem } from '@radix-ui/react-select'

import { ReactComponent as ChevronDownSVG } from '../../assets/icons/chevron-down.svg';

import './Select.scss';

export type SelectOption = {
    label: string;
    value: string;
}

type SelectProps = {
    classNameButton?: string;
    classNameDropdown?: string;
    options: SelectOption[];
    selection?: SelectOption;
    onChange: (selection: SelectOption | undefined) => void
}


export const Select = ({ classNameButton, classNameDropdown, options, selection, onChange }: SelectProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const contentStyle = {
        width: buttonRef.current?.offsetWidth,
    }

    const fullClassNameButton = ClassName('default-select-button', classNameButton)
    const fullClassNameDropdown = ClassName('default-select-dropdown', classNameDropdown)

    return (
        <Root
            value={selection?.value}
            onValueChange={(newValue) => onChange(options.find(({ value }) => value === newValue))}
        >
            <Trigger className={fullClassNameButton} ref={buttonRef}>
                <Value placeholder="Please select team">{selection?.label}</Value>
                <Icon>
                    <ChevronDownSVG className="chevron-icon" />
                </Icon>
            </Trigger>

            <Portal>
                <Content className={fullClassNameDropdown} position="popper" style={contentStyle}>
                    <Viewport>
                        {options.map((option) => (
                            <SelectItem className="default-select-item" value={option.value} key={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Viewport>
                </Content>
            </Portal>
        </Root>
    )
}
