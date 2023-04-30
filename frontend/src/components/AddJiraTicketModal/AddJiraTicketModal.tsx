import ClassName from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

import { jira } from '../../services/jira';
import { useTypedSelector, useTypedDispatch } from '../../store/hooks';
import { createMultipleTickets } from '../../store/actions/estimation/tickets';
import { Button } from '../Button';
import { ModalWithButton } from '../Modal';
import { BoardPicker } from './BoardPicker';
import { IssuePicker } from './IssuePicker';

import type { JiraBoard, JiraIssue } from '../../services/jira/jira.types';

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
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [boards, setBoards] = useState([] as JiraBoard[]);
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [issues, setIssues] = useState([] as JiraIssue[]);
    const [selectedIssues, setSelectedIssues] = useState([] as JiraIssue[])
    const [issueSearchTerm, setIssueSearchTerm] = useState('');

    const user = useTypedSelector((state) => state.user);

    const handleGetTickets = async (selectedBoard: number, searchTerm?: string) => {
        if (!selectedBoard) return;

        setLoadingIssues(true);
        const res = await jira.getAllIssuesFromBoard(selectedBoard, searchTerm);
        setLoadingIssues(false);

        if (!res) return

        setIssues(res.data.issues)
    }

    useEffect(() => {
        if (selectedBoard && !issues.length) {
            handleGetTickets(selectedBoard);
        }
    }, [selectedBoard])

    const handleShowModal = async () => {
        setIsVisible(true);
        setLoadingBoards(true);

        if (!jira.authorized && user.id) {
            await jira.auth(user.id);
        }

        if (boards.length) return setLoadingBoards(false);

        const res = await jira.getAllBoards();
        setLoadingBoards(false);

        if (!res?.data) return;

        setBoards(res.data.values)
    }

    const debouncedGetTickets = useCallback(debounce(handleGetTickets), [])

    const handleSetIssueSearchTerm = (searchTerm: string) => {
        setIssueSearchTerm(searchTerm);

        if (!selectedBoard) return;

        debouncedGetTickets(selectedBoard, searchTerm)
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
        setIssues([]);
        setIssueSearchTerm('');
    }

    const getModalContent = () => {
        if (!selectedBoard) {
            return <BoardPicker loading={loadingBoards} boards={boards} onSelect={setSelectedBoard} />
        }

        return (
            <IssuePicker
                issues={issues}
                loading={loadingIssues}
                searchTerm={issueSearchTerm}
                setSearchTerm={handleSetIssueSearchTerm}
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
