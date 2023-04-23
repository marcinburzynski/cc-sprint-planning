import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { useTypedDispatch } from '../../store/hooks';
import { socket } from '../../services/socket';
import { setUser } from '../../store/actions/user';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { TeamsCreator } from '../../components/TeamsCreator';

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

        const { sessionId, user } = await socket.createAndJoinSession(partialUser, teams)

        dispatch(setUser(user))
        navigateTo(`/session/${sessionId}`)
    }

    return (
        <div className="create-session-page">
            <div className="create-session-page-box">
                <span className="header">
                    Start new planning
                </span>

                <label className="name-label">Your name:</label>
                <Input className="name-input" value={username} onChange={setUsername} />

                <label className="teams-label">Teams:</label>
                <TeamsCreator teams={teams} onChange={setTeams} />

                <Button className="start-button" onClick={handleStartSession}>Start</Button>
            </div>
        </div>
    )
}
