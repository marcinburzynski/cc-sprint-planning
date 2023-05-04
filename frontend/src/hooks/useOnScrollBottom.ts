import { useCallback, useEffect, useRef, RefObject } from 'react'

export const useBottomScrollListener = <T extends HTMLElement>(
    onBottom: () => void,
    offset = 400,
): RefObject<T> => {
    const containerRef = useRef<T>(null)

    const handleOnScroll = useCallback(() => {
        if (!containerRef.current) return

        const scrollNode: T = containerRef.current;
        const scrollContainerBottomPosition = Math.round(scrollNode.scrollTop + scrollNode.clientHeight);
        const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

        if (scrollPosition <= scrollContainerBottomPosition) {
            onBottom();
        }
    }, [onBottom, containerRef.current])

    useEffect((): (() => void) => {
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', handleOnScroll)
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('scroll', handleOnScroll)
            }
        }
    }, [handleOnScroll])

    return containerRef
}
