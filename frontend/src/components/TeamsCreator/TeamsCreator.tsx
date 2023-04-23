import ClassName from 'classnames';
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';

import { Input } from '../Input';

import { ReactComponent as TrashIconSVG } from '../../assets/icons/trash-bin.svg';
import { ReactComponent as PlusIconSVG } from '../../assets/icons/plus.svg';

import './TeamsCreator.scss';


type TeamsCreatorProps = {
    className?: string;
    teams: string[];
    onChange: (teams: string[]) => void;
}

const DEFAULT_TEAMS = ['Developers', 'QA']

export const TeamsCreator = ({ className, teams, onChange }: TeamsCreatorProps) => {
    const [newTeamName, setNewTeamName] = useState('');

    useEffect(() => {
        if (!isEqual(teams, DEFAULT_TEAMS)) {
            onChange(DEFAULT_TEAMS)
        }
    }, [])

    const handleAddTeam = () => {
        if (teams.includes(newTeamName) || !newTeamName) return

        onChange([...teams, newTeamName])
        setNewTeamName('')
    }

    const handleRemoveTeam = (team: string) => {
        onChange(teams.filter((teamName) => teamName !== team))
    }

    const fullClassName = ClassName('teams-creator', className)

    return (
        <div className={fullClassName}>
            <div className="teams-list">
                {teams.map((team) => (
                    <div className="team" key={team}>
                        <span>{team}</span>
                        <TrashIconSVG className="trash-icon" onClick={() => handleRemoveTeam(team)} />
                    </div>
                ))}
            </div>

            <div className="add-team-container">
                <Input value={newTeamName} onChange={setNewTeamName} />
                <PlusIconSVG className="add-team-button" onClick={handleAddTeam} />
            </div>
        </div>
    )
}
