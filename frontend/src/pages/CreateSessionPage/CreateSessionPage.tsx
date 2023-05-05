import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import { useTypedDispatch } from '../../store/hooks';
import { socket } from '../../services/socket';
import { http } from '../../services/http';
import { setUser } from '../../store/actions/user';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { TeamsCreator } from '../../components/TeamsCreator';

import type { UserType } from '../../types/commonTypes';

import './CreateSessionPage.scss';

export const CreateSessionPage = () => {
    const navigateTo = useNavigate();
    const dispatch = useTypedDispatch();

    const [username, setUsername] = useState('');
    const [teams, setTeams] = useState<string[]>([]);

    const handleStartSession = async () => {
        if (isEmpty(teams) || !username) return;

        const partialUser = {
            name: username,
            isSpectator: true,
        }

        const [
            { data: { sessionId } },
            { data: { token } },
        ] = await Promise.all([
            http.createSession(teams),
            http.createUser(partialUser),
        ]);

        await socket.joinSession(sessionId, token);

        const decodedUser = jwtDecode(token) as UserType;

        dispatch(setUser(decodedUser))
        navigateTo(`/session/${sessionId}`)
    }

    return (
        <div className="create-session-page">
            <span className="create-session-main-header">Sprint planning</span>

            <div className="create-session-page-box">
                <span className="header">
                    Start new planning
                </span>

                <label className="name-label">Your name:</label>
                <Input className="name-input" value={username} onChange={setUsername} />

                <label className="teams-label">Teams:</label>
                <TeamsCreator className="teams-creator" teams={teams} onChange={setTeams} />

                <Button
                    className="start-button"
                    onClick={handleStartSession}
                    buttonSize="medium"
                >
                    Start
                </Button>
            </div>
        </div>
    )
}
