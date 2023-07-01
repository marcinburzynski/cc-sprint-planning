import { ComponentProps } from 'react';
import ClassName from 'classnames';

import { Button } from '../Button';

import { ReactComponent as GoogleLogoSVG } from '../../assets/icons/google-logo.svg';

import './GoogleOAuthButton.scss';

export const GoogleOAuthButton = ({ className, ...props }: ComponentProps<typeof Button>) => {
    const fullClassName = ClassName('default-google-auth-button', className);

    return (
        <Button
            className={fullClassName}
            buttonStyle="outline"
            {...props}
        >
            <GoogleLogoSVG />
            <span>Sign in with Google</span>
        </Button>
    )
}