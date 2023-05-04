import ClassName from 'classnames';
import { useState } from 'react';

import { jira } from '../../services/jira';
import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { createMultipleTickets } from '../../store/actions/estimation/tickets';
import { Button } from '../Button';
import { ModalWithButton } from '../Modal';
import { BoardPicker } from './BoardPicker';
import { IssuePicker } from './IssuePicker';

import type { JiraIssue } from '../../services/jira/jira.types';

import { ReactComponent as JiraIconSVG } from '../../assets/icons/jira.svg';
import { ReactComponent as ChevronLeftIconSVG } from '../../assets/icons/chevron-left.svg';

import './AddJiraTicketModal.scss';

type AddJiraTicketModalProps = {
    buttonClassName?: string;
}

export const AddJiraTicketModal = ({ buttonClassName }: AddJiraTicketModalProps) => {
    const dispatch = useTypedDispatch();

    const [isVisible, setIsVisible] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<number>();
    const [selectedIssues, setSelectedIssues] = useState([] as JiraIssue[])

    const user = useTypedSelector((state) => state.user);

    const handleShowModal = async () => {
        if (!jira.authorized && user.id) {
            await jira.auth(user.id);
        }

        setIsVisible(true);
    }

    const handleAddTickets = (issues: JiraIssue[]) => {
        setIsVisible(false);
        setSelectedIssues([]);

        dispatch(createMultipleTickets(issues.map((issue) => ({
            name: `${issue.key}: ${issue.fields.summary}`,
            issueKey: issue.key,
        }))));
    }

    const handleGoBackToBoardSelection = () => {
        setSelectedBoard(undefined);
    }

    const getModalContent = () => {
        if (!selectedBoard) {
            return <BoardPicker onSelect={setSelectedBoard} />
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
        <Button className={buttonFullClassName} onClick={handleShowModal}>
            <JiraIconSVG />
            <span>Get tickets from jira</span>
        </Button>
    )

    const headerButton = selectedBoard
        ? <ChevronLeftIconSVG className="go-back-button" onClick={handleGoBackToBoardSelection} />
        : null

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
