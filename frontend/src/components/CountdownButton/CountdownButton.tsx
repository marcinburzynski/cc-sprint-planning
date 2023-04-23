import { useState, useRef, useCallback } from 'react';

import { Button } from '../Button';

import { ReactComponent as CrossIconSVG } from '../../assets/icons/cross.svg';

import './CountdownButton.scss';

type CountdownButtonProps = Omit<JSX.IntrinsicElements['button'], 'onClick'> & {
    secondsToCountDown: number;
    onClick?: () => void;
}

export const CountdownButton = ({ secondsToCountDown, onClick, children, ...props }: CountdownButtonProps) => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [counter, setCounter] = useState(secondsToCountDown);

    const countdownInterval = useRef<number>();

    const handleStartCounter = () => {
        countdownInterval.current = setInterval(() => {

        }, secondsToCountDown * 1000)
    }

    const handleResetCounter = () => {

    }

    const handleClick = () => {
        if (isCountingDown) {
            return handleResetCounter();
        }

        handleStartCounter();
    }

    const handleMouseOver = () => {
        if (!isMouseOver) {
            setIsMouseOver(true);
        }
    }

    const handleMouseOut = () => {
        if (isMouseOver) {
            setIsMouseOver(false);
        }
    }

    const getButtonContent = () => {
        if (isCountingDown) {
            if (isMouseOver) {
                return <CrossIconSVG />;
            }

            return counter;
        }

        return children;
    }

    return (
        <Button
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            {...props}
        >
            {getButtonContent()}
        </Button>
    )
}
