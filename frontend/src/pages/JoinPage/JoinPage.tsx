import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { pick, isEqual } from 'lodash';
import jwtDecode from 'jwt-decode';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { isCompleteUser } from '../../types/typePredicates';
import { getTeams } from '../../store/actions/estimation/session';
import { socket } from '../../services/socket';
import { http } from '../../services/http';
import { google } from '../../services/google';
import { setUser } from '../../store/actions/user';
import { setNotification } from '../../store/actions/notifications';
import { LogoHeader } from '../../components/LogoHeader';
import { UserProfile } from '../../components/UserProfile';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GoogleOAuthButton } from '../../components/GoogleOAuthButton';
import { Checkbox } from '../../components/Checkbox';
import { Select, type SelectOption } from '../../components/Select';
import { showErrorViaNotification } from '../../utils/errors';
import { TOKEN_LOCAL_STORAGE_KEY } from '../../constants/localStorageKeys';

import type { UserType } from '../../types/commonTypes';

import './JoinPage.scss';

export const JoinPage = () => {
    const dispatch = useTypedDispatch()
    const navigateTo = useNavigate();
    const { sessionId } = useParams<'sessionId'>();
    const [searchParams] = useSearchParams();

    const teams = useTypedSelector((state) => state.estimation.session.teams);
    const loggedUser = useTypedSelector((state) => state.user);

    const [username, setUsername] = useState('');
    const [isSpectator, setIsSpectator] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<SelectOption | undefined>()
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userToken = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY);

        if ((!userToken || searchParams.has('test')) && sessionId) {
            dispatch(getTeams(sessionId))
        } else {
            navigateTo(`/session/${sessionId}`)
        }
    }, [])

    useEffect(() => {
        if (!selectedTeam && teams.length) {
            setSelectedTeam({ value: teams[0], label: teams[0] })
        }
    }, [teams])

    const createUpdateOrGetUser = async () => {
        if (isCompleteUser(loggedUser)) {
            const currUserState = {
                isAdmin,
                isSpectator,
                name: username,
                team: selectedTeam?.value,
            };

            const prevUserState = pick(loggedUser, ...Object.keys(currUserState));

            if (!isEqual(currUserState, prevUserState)) {
                const { data } = await http.updateYourUser(currUserState);
                return data.token;
            }
        } else {
            const { data } = await http.createUser({
                isSpectator,
                isAdmin,
                name: username,
                team: isSpectator ? undefined : selectedTeam?.value,
            });

            return data.token;
        }

        return http.token;
    }

    const handleJoinSession = async () => {
        if (!selectedTeam || !username || !sessionId) return

        setLoading(true);

        try {
            const token = await createUpdateOrGetUser();

            if (!token) {
                return dispatch(setNotification(
                    'Couldn\'t access user token',
                    { notificationType: 'error' },
                ));
            }

            await socket.joinSession(sessionId, token);

            const decodedUser: UserType = jwtDecode(token);
            dispatch(setUser(decodedUser));

            navigateTo(`/session/${sessionId}`);
        } catch (e: unknown) {
            showErrorViaNotification('Failed to join session.', e, dispatch);
        }

        setLoading(false);
    }

    const handleAuthGoogle = async () => {
        try {
            const token = await google.auth(sessionId);
            const decodedGoogleUser = jwtDecode<UserType>(token)

            setUsername(decodedGoogleUser.name);
            setIsAdmin(decodedGoogleUser.isAdmin);
            setIsSpectator(decodedGoogleUser.isSpectator);

            if (decodedGoogleUser.team) {
                setSelectedTeam({ label: decodedGoogleUser.team, value: decodedGoogleUser.team });
            }

            dispatch(setUser(decodedGoogleUser));
        } catch (e: unknown) {
            showErrorViaNotification('Failed to authorize with Google', e, dispatch);
        }
    }

    return (
        <div className="join-session-page">
            {isCompleteUser(loggedUser) && (
                <UserProfile
                    className="user-profile-button"
                    user={loggedUser}
                />
            )}

            <LogoHeader className="join-session-main-header" />

            <div className="join-session-page-box">
                <span className="header">Join Planning</span>

                {!isCompleteUser(loggedUser) && (
                    <GoogleOAuthButton
                        className="google-auth-button"
                        onClick={handleAuthGoogle}
                    />
                )}

                <label className="name-label">Your name:</label>
                <Input value={username} onChange={setUsername} />

                <label className="team-label">Team:</label>
                <Select
                    disabled={isSpectator}
                    options={teams.map((team) => ({ label: team, value: team }))}
                    selection={selectedTeam}
                    onChange={setSelectedTeam}
                />

                <div className="checkbox-container">
                    <Checkbox isChecked={isSpectator} onChange={setIsSpectator} />
                    <label onClick={() => setIsSpectator(!isSpectator)}>
                        Join as spectator
                    </label>
                </div>

                <div className="checkbox-container">
                    <Checkbox isChecked={isAdmin} onChange={setIsAdmin} />
                    <label onClick={() => setIsAdmin(!isAdmin)}>
                        Join as admin
                    </label>
                </div>

                <Button
                    loading={loading}
                    className="join-button"
                    buttonSize="medium"
                    onClick={handleJoinSession}
                >
                    Join
                </Button>
            </div>
        </div>
    )
}
