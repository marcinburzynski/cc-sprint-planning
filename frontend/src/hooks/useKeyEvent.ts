import { useEffect } from 'react';

export const useKeyEvent = (key: string, callback: (e: KeyboardEvent) => void) => {
    useEffect(() => {
        const eventHandler = (e: KeyboardEvent) => {
            if (e.key === key) {
                callback(e);
            }
        }

        window.addEventListener('keydown', eventHandler);

        return () => {
            window.removeEventListener('keydown', eventHandler);
        }
    }, [key, callback])
}
