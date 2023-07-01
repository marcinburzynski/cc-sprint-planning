import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { socket } from '../../services/socket';
import { http } from '../../services/http';
import { google } from '../../services/google';
import { setUser } from '../../store/actions/user';
import { setSession } from '../../store/actions/estimation/session';
import { setNotification } from '../../store/actions/notifications';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GoogleOAuthButton } from '../../components/GoogleOAuthButton';
import { UserProfile } from '../../components/UserProfile';
import { Select } from '../../components/Select';
import { TeamsCreator } from '../../components/TeamsCreator';
import { LogoHeader } from '../../components/LogoHeader';
import { DECKS } from '../../constants/decks';
import { showErrorViaNotification } from '../../utils/errors';
import { isCompleteUser } from '../../types/typePredicates';

import type { UserType } from '../../types/commonTypes';

import './CreateSessionPage.scss';

export const CreateSessionPage = () => {
    const navigateTo = useNavigate();
    const dispatch = useTypedDispatch();

    const loggedUser = useTypedSelector((state) => state.user);

    const [username, setUsername] = useState(loggedUser.name || '');
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedDeck, setSelectedDeck] = useState(DECKS.storyPoints.value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loggedUser.name !== username) {
            setUsername(loggedUser.name || username)
        }
    }, [loggedUser.name])

    const createUpdateOrGetUserAndSession = async () => {
        type StartSessionRequests = [
            ReturnType<typeof http.createSession>,
            (ReturnType<typeof http.createUser> | ReturnType<typeof http.updateYourUser>)?,
        ]

        const httpRequests: StartSessionRequests = [
            http.createSession(teams, DECKS[selectedDeck].deck),
        ]

        if (isCompleteUser(loggedUser)) {
            const updatedUser: UserType = {
                ...loggedUser,
                name: username,
            }

            if (loggedUser.name !== username) {
                httpRequests.push(http.updateYourUser(updatedUser))
            }
        } else {
            const partialUser = {
                name: username,
                isSpectator: true,
                isAdmin: true,
            }

            httpRequests.push(http.createUser(partialUser))
        }

        const [
            { data: { session } },
            userRes,
        ] = await Promise.all(httpRequests);

        return {
            session,
            userToken: userRes?.data?.token || http.token,
        };
    }

    const handleStartSession = async () => {
        if (!username || isEmpty(teams) || !DECKS[selectedDeck]) return;

        setLoading(true);

        try {
            const { session, userToken } = await createUpdateOrGetUserAndSession();

            if (!userToken) {
                return dispatch(setNotification(
                    'Failed getting user token',
                    { notificationType: 'error' },
                ))
            }

            http.init(userToken);
            await socket.joinSession(session.id, userToken);

            const decodedUser = jwtDecode<UserType>(userToken);

            dispatch(setSession(session));
            dispatch(setUser(decodedUser));
            navigateTo(`/session/${session.id}`);
        } catch (e: unknown) {
            showErrorViaNotification('Failed to create a session', e, dispatch);
        }

        setLoading(false)
    }

    const handleAuthGoogle = async () => {
        try {
            const token = await google.auth();
            const decodedGoogleUser = jwtDecode<UserType>(token)

            setUsername(decodedGoogleUser.name);
            dispatch(setUser(decodedGoogleUser));
        } catch (e: unknown) {
            showErrorViaNotification('Failed to authorize with Google', e, dispatch);
        }
    }

    return (
        <div className="create-session-page">
            {isCompleteUser(loggedUser) && (
                <UserProfile
                    className="user-profile-button"
                    user={loggedUser}
                />
            )}

            <LogoHeader className="create-session-main-header" />

            <div className="create-session-page-box">
                <span className="header">
                    Start new planning
                </span>

                {!isCompleteUser(loggedUser) && (
                    <GoogleOAuthButton
                        className="google-auth-button"
                        onClick={handleAuthGoogle}
                    />
                )}

                <label>Your name:</label>
                <Input className="name-input" value={username} onChange={setUsername} />

                <label>Cards deck:</label>
                <Select
                    selection={DECKS[selectedDeck]}
                    options={Object.values(DECKS)}
                    onChange={(selection) => selection && setSelectedDeck(selection.value)}
                />

                <label>Teams:</label>
                <TeamsCreator className="teams-creator" teams={teams} onChange={setTeams} />

                <Button
                    className="start-button"
                    onClick={handleStartSession}
                    buttonSize="medium"
                    loading={loading}
                >
                    Start
                </Button>
            </div>
        </div>
    )
}
