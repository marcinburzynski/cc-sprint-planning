import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import { useTypedDispatch } from '../../store/hooks';
import { socket } from '../../services/socket';
import { http } from '../../services/http';
import { setUser } from '../../store/actions/user';
import { setSession } from '../../store/actions/estimation/session';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { TeamsCreator } from '../../components/TeamsCreator';
import { LogoHeader } from '../../components/LogoHeader';
import { DECKS } from '../../constants/decks';
import { showErrorViaNotification } from '../../utils/errors';

import type { UserType } from '../../types/commonTypes';

import './CreateSessionPage.scss';

export const CreateSessionPage = () => {
    const navigateTo = useNavigate();
    const dispatch = useTypedDispatch();

    const [username, setUsername] = useState('');
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedDeck, setSelectedDeck] = useState(DECKS.storyPoints.value);
    const [loading, setLoading] = useState(false);

    const handleStartSession = async () => {
        if (!username || isEmpty(teams) || !DECKS[selectedDeck]) return;

        const partialUser = {
            name: username,
            isSpectator: true,
            isAdmin: true,
        }

        setLoading(true);

        try {
            const [
                { data: { session } },
                { data: { token } },
            ] = await Promise.all([
                http.createSession(teams, DECKS[selectedDeck].deck),
                http.createUser(partialUser),
            ]);

            await socket.joinSession(session.id, token);

            const decodedUser = jwtDecode<UserType>(token);

            dispatch(setSession(session));
            dispatch(setUser(decodedUser));
            navigateTo(`/session/${session.id}`);
        } catch (e: unknown) {
            showErrorViaNotification('Failed to create a session', e, dispatch);
        }

        setLoading(false)
    }

    return (
        <div className="create-session-page">
            <LogoHeader className="create-session-main-header" />

            <div className="create-session-page-box">
                <span className="header">
                    Start new planning
                </span>

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
