import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useTypedDispatch } from '../../store/hooks';
import { socket } from '../../services/socket';
import { setUser } from '../../store/actions/user';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Select, type SelectOption } from '../../components/Select';

import './JoinPage.scss';

export const JoinPage = () => {
    const dispatch = useTypedDispatch()
    const navigateTo = useNavigate();
    const { sessionId } = useParams<'sessionId'>();

    const [username, setUsername] = useState('');
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<SelectOption | undefined>()

    const handleGetSessionTeams = async () => {
        if (!sessionId) return

        const { teams: receivedTeams } = await socket.getSessionTeams(sessionId)

        setTeams(receivedTeams)
        setSelectedTeam({ value: receivedTeams[0], label: receivedTeams[0] })
    };

    useEffect(() => {
        handleGetSessionTeams();
    }, [])

    const handleJoinSession = async () => {
        if (!selectedTeam || !username || !sessionId) return

        const { user } = await socket.joinSession(sessionId, {
            name: username,
            isSpectator: false,
            team: selectedTeam.value,
        })

        dispatch(setUser(user));
        navigateTo(`/session/${sessionId}`)
    }

    return (
        <div className="join-session-page">
            <div className="join-session-page-box">
                <span className="header">Join Planning</span>

                <label className="name-label">Your name:</label>
                <Input value={username} onChange={setUsername} />

                <label className="team-label">Team:</label>
                <Select
                    options={teams.map((team) => ({ label: team, value: team }))}
                    selection={selectedTeam}
                    onChange={setSelectedTeam}
                />

                <Button className="join-button" onClick={handleJoinSession}>
                    Join
                </Button>
            </div>
        </div>
    )
}
