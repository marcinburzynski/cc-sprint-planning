import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

import { jira, type GetIssuesSearchParams } from '../../../services/jira';
import { useBottomScrollListener } from '../../../hooks';
import { IssueItem } from './IssueItem';
import { SprintPicker } from './SprintPicker';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { Spinner } from '../../Spinner';

import type { JiraIssue } from '../../../services/jira/jira.types';

import './IssuePicker.scss';

type IssuePickerProps = {
    selectedIssues: JiraIssue[];
    selectedBoard: number;
    onChange: (selectedIssues: JiraIssue[]) => void;
    onAddTickets: (selectedIssueIds: JiraIssue[]) => void;
}

export const IssuePicker = ({
    selectedIssues,
    selectedBoard,
    onChange,
    onAddTickets,
}: IssuePickerProps) => {
    const [issues, setIssues] = useState([] as JiraIssue[]);
    const [loading, setLoading] = useState(false);
    const [totalIssues, setTotalIssues] = useState<number>();
    const [selectedSprintId, setSelectedSprintId] = useState<number>();
    const [searchTerm, setSearchTerm] = useState('');

    const handleGetTickets = async (params: GetIssuesSearchParams) => {
        if (!selectedBoard) return;

        if (!params.startAt) {
            setIssues([]);
        }

        setLoading(true);
        const { data } = await jira.getIssues(params);
        setLoading(false);

        setTotalIssues(data.total);

        if (params.startAt) {
            return setIssues([...issues, ...data.issues])
        }

        setIssues(data.issues);
    };

    const handleOnScrollBottom = () => {
        if (loading) return;
        if (totalIssues && issues.length >= totalIssues) return

        handleGetTickets({
            boardId: selectedBoard,
            sprintId: selectedSprintId,
            searchText: searchTerm,
            startAt: issues.length,
        });
    };

    const listRef = useBottomScrollListener<HTMLDivElement>(handleOnScrollBottom)

    useEffect(() => {
        if (!issues.length) {
            handleGetTickets({ boardId: selectedBoard, searchText: searchTerm });
        }

        return () => {
            setIssues([]);
        }
    }, []);

    const debouncedGetTickets = useCallback(debounce(handleGetTickets, 400), [])

    const handleSetIssueSearchTerm = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        debouncedGetTickets({
            boardId: selectedBoard,
            sprintId: selectedSprintId,
            searchText: searchTerm,
        });
    };

    const findIfSelected = (issue: JiraIssue) => !!selectedIssues.find(({ id }) => id === issue.id)

    const handleSelectIssue = (issue: JiraIssue) => {
        if (findIfSelected(issue)) {
            return onChange(selectedIssues.filter(({ id }) => id !== issue.id))
        }

        onChange([...selectedIssues, issue]);
    }

    const handleSelectSprint = (sprintId?: number) => {
        if (sprintId === selectedSprintId) return;

        setSelectedSprintId(sprintId);
        setIssues([]);

        handleGetTickets({
            sprintId,
            boardId: selectedBoard,
            searchText: searchTerm,
        })
    }

    return (
        <div className="default-issue-picker">
            <div className="issue-picker-filters">
                <Input value={searchTerm} onChange={handleSetIssueSearchTerm} placeholder="Search" />
                <SprintPicker
                    className="sprint-picker"
                    selectedBoardId={selectedBoard}
                    selectedSprintId={selectedSprintId}
                    onChange={handleSelectSprint}
                />
            </div>

            <div className="issues-list" ref={listRef}>
                {issues.map((issue) => (
                    <IssueItem
                        issue={issue}
                        isSelected={findIfSelected(issue)}
                        onClick={handleSelectIssue}
                    />
                ))}

                {loading && (
                    <div className="loading-container">
                        <Spinner />
                    </div>
                )}
            </div>

            <div className="issues-picker-footer">
                <Button disabled={!selectedIssues.length} onClick={() => onChange([])}>
                    {selectedIssues.length
                        ? `Clear ${selectedIssues.length} ${selectedIssues.length > 1 ? 'selections' : 'selection'}`
                        : 'Nothing selected'}
                </Button>

                <Button onClick={() => onAddTickets(selectedIssues)}>
                    Add tickets
                </Button>
            </div>
        </div>
    )
}
