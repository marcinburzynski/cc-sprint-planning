import { useState, useRef } from 'react';
import ClassName from 'classnames';

import { useKeyEvent } from '../../../hooks';
import { Input } from '../../Input';
import { Button } from '../../Button';

import { ReactComponent as TrashIconSVG } from '../../../assets/icons/trash-bin.svg';
import { ReactComponent as EditIconSVG } from '../../../assets/icons/edit.svg';

import './TeamItem.scss';

type TeamItemProps = {
    className?: string;
    name: string;
    onChange: (oldTeamName: string, newTeamName: string) => void;
    onRemove: (teamName: string) => void;
}

export const TeamItem = ({ className, name, onChange, onRemove }: TeamItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTeamName, setNewTeamName] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpdateTeam = () => {
        if (!isEditing) return;
        if (!newTeamName) return;

        if (name !== newTeamName) {
            onChange(name, newTeamName);
        }

        setIsEditing(false);
        setNewTeamName(name);
    }

    const handleUpdateTeamOnEnter = (e: KeyboardEvent) => {
        if (e.target !== inputRef.current) return;
        handleUpdateTeam()
    }

    const handleExitEditMode = () => {
        setIsEditing(false);
        setNewTeamName(name);
    }

    const handleEscapeEditMode = (e: KeyboardEvent) => {
        if (e.target !== inputRef.current) return;
        handleExitEditMode();
    }

    useKeyEvent('Enter', handleUpdateTeamOnEnter);
    useKeyEvent('Escape', handleEscapeEditMode);

    const fullClassName = ClassName('default-team-item', className);
    const fullEditWrapperClassName = ClassName('default-team-item-edit-wrapper', className)

    if (isEditing) {
        return (
            <div className={fullEditWrapperClassName}>
                <div className={fullClassName}>
                    <Input autoFocus value={newTeamName} onChange={setNewTeamName} inputRef={inputRef} />
                </div>

                <div className="edit-buttons">
                    <Button buttonStyle="outline" onClick={handleExitEditMode}>
                        Cancel
                    </Button>

                    <Button onClick={handleUpdateTeam}>
                        Apply
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={fullClassName}>
            <span className="team-name">
                {name}
            </span>

            <EditIconSVG className="edit-icon" onClick={() => setIsEditing(true)} />
            <TrashIconSVG onClick={() => onRemove(name)} />
        </div>
    )
}
