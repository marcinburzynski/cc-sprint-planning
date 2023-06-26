import ClassName from 'classnames';
import { useState } from 'react';

import { jira } from '../../services/jira';
import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { selectJiraBoard } from '../../store/actions/jira/boards';
import { createMultipleTickets } from '../../store/actions/estimation/tickets';
import { Button } from '../Button';
import { ModalWithButton } from '../Modal';
import { BoardPicker } from './BoardPicker';
import { IssuePicker } from './IssuePicker';

import type { JiraIssue } from '../../services/jira/jira.types';

import { ReactComponent as ChevronLeftIconSVG } from '../../assets/icons/chevron-left.svg';

import './AddJiraTicketModal.scss';

type AddJiraTicketModalProps = {
    buttonClassName?: string;
}

export const AddJiraTicketModal = ({ buttonClassName }: AddJiraTicketModalProps) => {
    const dispatch = useTypedDispatch();

    const [isVisible, setIsVisible] = useState(false);
    const [selectedIssues, setSelectedIssues] = useState([] as JiraIssue[])

    const user = useTypedSelector((state) => state.user);
    const selectedBoard = useTypedSelector((state) => state.jira.boards.selectedBoardId)

    const handleShowModal = async () => {
        if (!jira.authorized && user.id) {
            await jira.auth(user.id);
        }

        setIsVisible(true);
    }

    const handleAddTickets = async (issues: JiraIssue[]) => {
        setIsVisible(false);
        setSelectedIssues([]);

        const jiraUrl = await jira.getJiraUrl()

        dispatch(createMultipleTickets(issues.map((issue) => ({
            name: `${issue.key}: ${issue.fields.summary}`,
            issueKey: issue.key,
            issueUrl: `${jiraUrl}/browse/${issue.key}`,
        }))));
    }

    const handleGoBackToBoardSelection = () => {
        dispatch(selectJiraBoard(null));
    }

    const getModalContent = () => {
        if (!selectedBoard) {
            return <BoardPicker />
        }

        return (
            <IssuePicker
                selectedBoard={selectedBoard}
                selectedIssues={selectedIssues}
                onChange={setSelectedIssues}
                onAddTickets={handleAddTickets}
            />
        );
     }

    const buttonFullClassName = ClassName('add-jira-ticket-modal-button', buttonClassName)

    const triggerButton = (
        <Button
            buttonSize="medium"
            buttonStyle="outline"
            className={buttonFullClassName}
            onClick={handleShowModal}
        >
            <span>Import from jira</span>
        </Button>
    )

    const headerButton = selectedBoard ? (
        <div className="go-back-button" onClick={handleGoBackToBoardSelection}>
            <ChevronLeftIconSVG />
            <span>Select board</span>
        </div>
    ) : null

    return (
        <ModalWithButton
            modalClassName="jira-ticket-modal"
            triggerButton={triggerButton}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            header={headerButton}
        >
            <div className="jira-ticket-modal-content">
                {getModalContent()}
            </div>
        </ModalWithButton>
    )
}
