import ClassName from 'classnames';
import { MouseEventHandler } from 'react';

import type { JiraIssue } from '../../../../services/jira/jira.types';

import { ReactComponent as LinkIconSVG } from '../../../../assets/icons/link.svg';

import './IssueItem.scss';

type IssueItemProps = {
    issue: JiraIssue;
    isSelected: boolean;
    onClick: (issue: JiraIssue) => void;
}

export const IssueItem = ({ issue, isSelected, onClick }: IssueItemProps) => {

    const handleClickLink = (issue: JiraIssue): MouseEventHandler<SVGElement> => (e) => {
        e.stopPropagation();
        window.open(`https://shareablee.atlassian.net/browse/${issue.key}`, '_blank');
    };

    const fullClassName = ClassName('issue-item', { 'issue-item--selected': isSelected });

    return (
        <div
            className={fullClassName}
            onClick={() => onClick(issue)}
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
    );
}
