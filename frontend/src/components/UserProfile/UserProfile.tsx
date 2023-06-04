import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { getTeams } from '../../store/actions/estimation/session';
import { updateUser } from '../../store/actions/user';
import { UserAvatar } from './UserAvatar';
import { Popup } from '../Popup';
import { Select } from '../Select';
import { Input } from '../Input';
import { ConfirmationModal, DetachedConfirmationModal } from '../ConfirmationModal';

import { ReactComponent as EditIconSVG } from '../../assets/icons/edit.svg';

import type { UserType } from '../../types/commonTypes';

import './UserProfile.scss';

type UserProfileProps = {
    className?: string;
    user: UserType;
}

export const UserProfile = ({ className, user }: UserProfileProps) => {
    const dispatch = useTypedDispatch();
    const { sessionId } = useParams<{ sessionId: string }>();

    const [updatedUsername, setUpdatedUsername] = useState(user.name);
    const [isSelectTeamModalVisible, setIsSelectTeamModalVisible] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(user.team ? { label: user.team, value: user.team } : undefined);

    const teams = useTypedSelector((state) => state.estimation.session.teams);
    const userRoleLabel = useMemo(() => {
        if (user.isAdmin && user.isSpectator) return 'Game master (Viewer)'
        if (user.isSpectator) return 'Viewer';
        if (user.isAdmin) return `Game master${user.team ? ` (${user.team})` : ''}`;
        if (user.team) return user.team;

        return '';
    }, [user])

    useEffect(() => {
        if (!teams.length && sessionId) {
            dispatch(getTeams(sessionId));
        }

        if (!selectedTeam && teams.length) {
            setSelectedTeam({ label: teams[0], value: teams[0] });
        }
    }, [teams])

    const handleChangeName = async () => {
        if (updatedUsername === user.name) return;

        await dispatch(updateUser({ name: updatedUsername }));
    }

    const handleJoinTeam = async () => {
        if (!selectedTeam) return;

        await dispatch(updateUser({ team: selectedTeam.value, isSpectator: false }));
        setIsSelectTeamModalVisible(false);
    }

    const handleClickRoleButton = () => {
        if (user.isSpectator) {
            if (user.team) {
                return dispatch(updateUser({ isSpectator: false }));
            }

            return setIsSelectTeamModalVisible(true);
        }

        dispatch(updateUser({ isSpectator: true }));
    }

    const editNameModalContent = (
        <Input
            value={updatedUsername}
            onChange={setUpdatedUsername}
        />
    )

    const teamsOptions = useMemo(() => {
        return teams.map((team) => ({ label: team, value: team }));
    }, [teams]);

    return (
        <Popup
            align="end"
            sideOffset={-14}
            alignOffset={5}
            dropdownClassName="user-profile-content"
            triggerClassName={className}
            dropdownButton={<UserAvatar user={user} />}
        >
            <div className="profile-description-row">
                <UserAvatar user={user} />
                <div className="profile-description-values">
                    <ConfirmationModal
                        title="Your name"
                        acceptLabel="Save"
                        className="user-profile__confirm-modal"
                        disableAccept={!updatedUsername}
                        content={editNameModalContent}
                        onAccept={handleChangeName}
                        onCancel={() => setUpdatedUsername(user.name)}
                    >
                        <div className="username">
                            <span>{user.name}</span>
                            <EditIconSVG />
                        </div>
                    </ConfirmationModal>
                    <span className="user-role">
                        {userRoleLabel}
                    </span>
                </div>
            </div>

            <span className="role-choice-button" onClick={handleClickRoleButton}>
                {user.isSpectator ? 'Join as a player' : 'Become a viewer'}
            </span>

            {isSelectTeamModalVisible && (
                <DetachedConfirmationModal
                    title="Select team you want to join in"
                    acceptLabel="Join team"
                    className="user-profile__confirm-modal"
                    disableAccept={!selectedTeam}
                    onAccept={handleJoinTeam}
                    onCancel={() => setIsSelectTeamModalVisible(false)}
                >
                    <Select
                        selection={selectedTeam}
                        options={teamsOptions}
                        onChange={((selectedTeam) => setSelectedTeam(selectedTeam))}
                        disabled={!teams}
                    />
                </DetachedConfirmationModal>
            )}
        </Popup>
    )
}
