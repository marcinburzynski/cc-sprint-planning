import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { GOOGLE_OAUTH_CODE, GOOGLE_OAUTH_STATE } from '../../constants/localStorageKeys';

export const GoogleOAuth = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && state) {
            localStorage.setItem(GOOGLE_OAUTH_CODE, code);
            localStorage.setItem(GOOGLE_OAUTH_STATE, state);
        }

        window.close()
    }, [searchParams.toString()]);

    return <div />;
}