import ClassName from 'classnames';
import { MouseEventHandler } from 'react';

import { Button } from '../../Button';
import { Input } from '../../Input';
import { Spinner } from '../../Spinner';

import type { JiraIssue } from '../../../services/jira/jira.types';

import { ReactComponent as LinkIconSVG } from '../../../assets/icons/link.svg';

import './IssuePicker.scss';

type IssuePickerProps = {
    issues: JiraIssue[];
    loading?: boolean;
    searchTerm: string;
    setSearchTerm: (newValue: string) => void;
    selectedIssues: JiraIssue[];
    onChange: (selectedIssues: JiraIssue[]) => void;
    onAddTickets: (selectedIssueIds: JiraIssue[]) => void;
}

export const IssuePicker = ({
    issues,
    loading,
    searchTerm,
    setSearchTerm,
    selectedIssues,
    onChange,
    onAddTickets,
}: IssuePickerProps) => {
    const findIfSelected = (issue: JiraIssue) => !!selectedIssues.find(({ id }) => id === issue.id)

    const handleSelect = (issue: JiraIssue) => {
        if (findIfSelected(issue)) {
            return onChange(selectedIssues.filter(({ id }) => id !== issue.id))
        }

        onChange([...selectedIssues, issue]);
    }

    const handleClickLink = (issue: JiraIssue): MouseEventHandler<SVGElement> => (e) => {
        e.stopPropagation();
        window.open(`https://shareablee.atlassian.net/browse/${issue.key}`, '_blank');
    }

    return (
        <div className="default-issue-picker">
            <Input value={searchTerm} onChange={setSearchTerm} placeholder="Search" />

            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="issues-list">
                    {issues.map((issue) => (
                        <div
                            className={ClassName('issue-item', { 'issue-item--selected': findIfSelected(issue) })}
                            onClick={() => handleSelect(issue)}
                            key={issue.id}
                        >
                            <div className="issue-description">
                                <div className="issue-header">
                                    <span className="issue-key">{issue.key}</span>
                                    <LinkIconSVG onClick={handleClickLink(issue)} />
                                </div>
                                <span className="issue-summary">
                                {issue.fields.summary}
                            </span>
                            </div>

                            <div className="issue-status">
                                <div className="issue-status-labels">
                                <span className="issue-status-name">
                                    <b>Status:</b> {issue.fields.status.name}
                                </span>
                                    {issue.fields.assignee && (
                                        <span className="issue-assignee-name">
                                        <b>Assignee:</b> {issue.fields.assignee.displayName}
                                    </span>
                                    )}
                                </div>

                                {issue.fields.assignee && (
                                    <img src={issue.fields.assignee.avatarUrls['48x48']} alt="assignee-avatar" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
