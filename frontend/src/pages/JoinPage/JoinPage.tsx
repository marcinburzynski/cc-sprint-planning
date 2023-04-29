import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

import { useTypedDispatch } from '../../store/hooks';
import { socket } from '../../services/socket';
import { http } from '../../services/http';
import { setUser } from '../../store/actions/user';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Select, type SelectOption } from '../../components/Select';

import type { UserType } from '../../types/commonTypes';

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

        const { data: { teams: receivedTeams } } = await http.getSessionTeams(sessionId);

        setTeams(receivedTeams)
        setSelectedTeam({ value: receivedTeams[0], label: receivedTeams[0] })
    };

    useEffect(() => {
        handleGetSessionTeams();
    }, [])

    const handleJoinSession = async () => {
        if (!selectedTeam || !username || !sessionId) return

        const { data } = await http.createUser({
            name: username,
            isSpectator: false,
            team: selectedTeam.value,
        })

        await socket.joinSession(sessionId, data.token)

        const decodedUser = jwtDecode(data.token) as UserType;

        dispatch(setUser(decodedUser));
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
