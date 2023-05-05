import { useState, useEffect } from 'react';
import ClassName from 'classnames';

import { useTypedSelector, useTypedDispatch } from '../../../store/hooks';
import { getBoards, selectJiraBoard } from '../../../store/actions/jira/boards';
import { Input } from '../../Input';
import { JiraImage } from '../../JiraImage';
import { Spinner } from '../../Spinner';

import './BoardPicker.scss';

type BoardPickerProps = {
    className?: string;
}

export const BoardPicker = ({ className }: BoardPickerProps) => {
    const dispatch = useTypedDispatch();

    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: boards,
        loading,
    } = useTypedSelector((state) => state.jira.boards);

    useEffect(() => {
        if (!boards.length) {
            dispatch(getBoards())
        }
    }, [])

    const filteredBoards = boards.filter((board) => (
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
        || board.location.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    const fullClassName = ClassName('default-board-picker', className);

    return (
        <div className={fullClassName}>
            <Input value={searchTerm} onChange={setSearchTerm} placeholder="Search" />

            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="boards-list">
                    {filteredBoards.map((board) => (
                        <div
                            key={`${board.id}`}
                            className="board-item"
                            onClick={() => dispatch(selectJiraBoard(board.id))}
                        >
                            <span className="board-name">{board.name} | {board.location.projectName}</span>
                            <JiraImage className="board-avatar" src={board.location.avatarURI} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
