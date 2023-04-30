import { useMemo } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
    children: JSX.Element;
}

export const Portal = ({ children }: PortalProps) => {
    const portalRoot = useMemo(() => document.getElementById('portalRoot'), []);

    if (!portalRoot) return null;

    return createPortal(children, portalRoot)
}
