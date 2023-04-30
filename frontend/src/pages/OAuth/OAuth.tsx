import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { JIRA_STATE_LOCAL_STORAGE_KEY, JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY } from '../../constants/localStorageKeys';

export const OAuth = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const state = searchParams.get('state');
        const token = searchParams.get('code');

        if (state && token) {
            localStorage.setItem(JIRA_STATE_LOCAL_STORAGE_KEY, state);
            localStorage.setItem(JIRA_OAUTH_TOKEN_LOCAL_STORAGE_KEY, token);
        }

        window.close();
    }, [searchParams.toString()])

    return <div />;
}
