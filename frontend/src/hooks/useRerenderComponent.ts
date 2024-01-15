import { useState } from 'react';

export const useRerenderComponent = () => {
    const [state, setState] = useState(false);

    return {
        rerender: () => setState(!state),
    };
};
