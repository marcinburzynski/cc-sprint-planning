import { useState } from 'react';
import { AxiosError } from 'axios';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { selectJiraBoard } from '../../store/actions/jira/boards';
import { setNotification } from '../../store/actions/notifications';
import { jira } from '../../services/jira';
import { DetachedConfirmationModal } from '../ConfirmationModal';
import { BoardPicker } from '../AddJiraTicketModal/BoardPicker';
import { Input } from '../Input';

import type { JiraTicketType, EstimateCardType } from '../../types/commonTypes';

import { ReactComponent as ChevronLeftIconSVG } from '../../assets/icons/chevron-left.svg';

import './SaveEstimateToJiraModal.scss';

type SaveEstimateToJiraModal = {
    ticket: JiraTicketType;
    deck: EstimateCardType[];
    initialEstimation: string;
    onHideModal: () => void;
}

export const SaveEstimateToJiraModal = ({
    ticket,
    deck,
    initialEstimation,
    onHideModal,
}: SaveEstimateToJiraModal) => {
    const dispatch = useTypedDispatch();

    const [estimate, setEstimate] = useState(initialEstimation)

    const selectedBoardId = useTypedSelector((state) => state.jira.boards.selectedBoardId);

    const handleSaveEstimateToJira = async () => {
        if (!selectedBoardId) return;

        const deckType = deck[0].type;

        switch (deckType) {
            case 'time': {
                const isNotValidTime = !/^\d+[dDmMhH]$/.test(estimate);

                if (isNotValidTime) {
                    return window.alert('Estimate has to be a valid time value (number followed by time unit m|h|d).');
                }

                break;
            }

            case 'story-points': {
                const isNotANumber = !/^\d+$/.test(estimate)

                if (isNotANumber) {
                    return window.alert('Estimate has to be a number!');
                }

                break;
            }
        }

        try {
            await jira.setEstimate(selectedBoardId, ticket.issueKey, estimate);
            dispatch(setNotification(`Estimate for issue ${ticket.issueKey} has been successfully saved in Jira.`))
            onHideModal();
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                dispatch(setNotification(
                    `Failed saving estimate for issue ${ticket.issueKey} in Jira.`,
                    { notificationType: 'error', description: `${e.code}\n${e.message}` },
                ))
            }
        }
    }

    return (
        <DetachedConfirmationModal
            stopPropagation
            className="default-save-estimate-to-jira-modal"
            title="Save estimate to Jira"
            hideButtons={!selectedBoardId}
            acceptLabel="Save estimate"
            onAccept={handleSaveEstimateToJira}
            onCancel={onHideModal}
        >
            <div className="default-save-estimate-to-jira-modal-content">
                {!selectedBoardId ? (
                    <>
                        <span className="header">Select board you want to save the estimate for</span>
                        <BoardPicker />
                    </>
                ) : (
                    <>
                        <div className="go-back-button" onClick={() => dispatch(selectJiraBoard(null))}>
                            <ChevronLeftIconSVG />
                            <span>Select board</span>
                        </div>
                        <span className="header">Estimate value</span>
                        <Input value={estimate} onChange={setEstimate} />
                    </>
                )}
            </div>
        </DetachedConfirmationModal>
    )
}
