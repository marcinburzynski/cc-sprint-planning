import { useState } from 'react';
import ClassName from 'classnames';

import { Button } from '../../Button';
import { TextArea } from '../../TextArea';
import { AddJiraTicketModal } from '../../AddJiraTicketModal';

import './AddTicket.scss';

type AddTicketProps = {
    className?: string;
    onAddTicket: (name: string) => void;
}

export const AddTicket = ({ className, onAddTicket }: AddTicketProps) => {
    const [isAddingManually, setIsAddingManually] = useState(false);
    const [newTicketName, setNewTicketName] = useState('');

    const handleAddNewTicketManually = () => {
        if (!newTicketName) return;

        onAddTicket(newTicketName);
        setIsAddingManually(false);
        setNewTicketName('');
    }

    const handleCancelAddingManually = () => {
        setIsAddingManually(false);
        setNewTicketName('');
    }

    const fullClassName = ClassName('default-add-ticket', className);

    return (
        <div className={fullClassName}>
            {isAddingManually ? (
                <div className="add-ticket-manually-container">
                    <TextArea
                        value={newTicketName}
                        onChange={setNewTicketName}
                        placeholder="Type issue name"
                    />
                    <div className="add-ticket-manually-buttons">
                        <Button
                            buttonStyle="outline"
                            onClick={handleCancelAddingManually}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="add-ticket-manually-button"
                            disabled={!newTicketName}
                            onClick={handleAddNewTicketManually}
                        >
                            Add issue
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="add-ticket-buttons">
                    <Button buttonSize="medium" onClick={() => setIsAddingManually(true)}>
                        Add issue
                    </Button>

                    <AddJiraTicketModal />
                </div>
            )}
        </div>
    )
}
