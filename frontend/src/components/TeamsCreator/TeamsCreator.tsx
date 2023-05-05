import ClassName from 'classnames';
import { useEffect, useState, useRef } from 'react';
import { isEqual } from 'lodash';

import { useKeyEvent } from '../../hooks';
import { TeamItem } from './TeamItem';
import { Input } from '../Input';
import { Button } from '../Button';

import './TeamsCreator.scss';


type TeamsCreatorProps = {
    className?: string;
    teams: string[];
    onChange: (teams: string[]) => void;
}

const DEFAULT_TEAMS = ['Developers', 'QA']

export const TeamsCreator = ({ className, teams, onChange }: TeamsCreatorProps) => {
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const newTeamInputRef = useRef<HTMLInputElement>(null);

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

    const handleCancelAddingTeam = () => {
        setNewTeamName('');
        setIsAddingTeam(false);
    };

    const handleEnterEvent = (e: KeyboardEvent) => {
        if (e.target !== newTeamInputRef.current) return;
        handleAddTeam();
    }

    const handleEscapeEvent = (e: KeyboardEvent) => {
        if (e.target !== newTeamInputRef.current) return;
        handleCancelAddingTeam();
    }

    useKeyEvent('Enter', handleEnterEvent)
    useKeyEvent('Escape', handleEscapeEvent)

    const handleUpdateTeamName = (oldTeamName: string, newTeamName: string) => {
        const teamIndex = teams.indexOf(oldTeamName);

        if (teamIndex === -1) return;

        const clonedTeams = [...teams];
        clonedTeams.splice(teamIndex, 1, newTeamName);

        onChange(clonedTeams);
    }

    const handleRemoveTeam = (team: string) => {
        onChange(teams.filter((teamName) => teamName !== team))
    }

    const fullClassName = ClassName('default-teams-creator', className)

    return (
        <div className={fullClassName}>
            <div className="teams-list">
                {teams.map((team) => (
                    <TeamItem
                        key={team}
                        className="team"
                        name={team}
                        onChange={handleUpdateTeamName}
                        onRemove={handleRemoveTeam}
                    />
                ))}
            </div>

            {isAddingTeam ? (
                <div className="add-team-form">
                    <Input
                        autoFocus
                        value={newTeamName}
                        onChange={setNewTeamName}
                        inputRef={newTeamInputRef}
                        placeholder="Type team name"
                    />

                    <div className="add-team-form-buttons">
                        <Button buttonStyle="outline" onClick={handleCancelAddingTeam}>
                            Cancel
                        </Button>

                        <Button onClick={handleAddTeam}>
                            Add team
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    className="show-team-adding-form-button"
                    buttonStyle="outline"
                    onClick={() => setIsAddingTeam(true)}
                >
                    + Add team
                </Button>
            )}
        </div>
    )
}
