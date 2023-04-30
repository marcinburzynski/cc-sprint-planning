import { useState } from 'react';

import { Input } from '../../Input';
import { JiraImage } from '../../JiraImage';
import { Spinner } from '../../Spinner';

import type { JiraBoard } from '../../../services/jira/jira.types';

import './BoardPicker.scss';

type BoardPickerProps = {
    boards: JiraBoard[];
    loading?: boolean;
    onSelect: (boardId: number) => void;
}

export const BoardPicker = ({ boards, loading, onSelect }: BoardPickerProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBoards = boards.filter((board) => (
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
        || board.location.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    return (
        <div className="default-board-picker">
            <Input value={searchTerm} onChange={setSearchTerm} placeholder="Search" />

            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="boards-list">
                    {filteredBoards.map((board) => (
                        <div className="board-item" onClick={() => onSelect(board.id)} key={`${board.id}`}>
                            <span className="board-name">{board.name} | {board.location.projectName}</span>
                            <JiraImage className="board-avatar" src={board.location.avatarURI} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
