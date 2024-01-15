import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useTypedDispatch, useTypedSelector } from '../../store/hooks';
import { useRerenderComponent } from '../../hooks/useRerenderComponent';
import { jira } from '../../services/jira';
import { getTeams } from '../../store/actions/estimation/session';
import { updateUser } from '../../store/actions/user';
import { UserAvatar } from './UserAvatar';
import { Popup } from '../Popup';
import { Select } from '../Select';
import { Input } from '../Input';
import { ConfirmationModal, DetachedConfirmationModal } from '../ConfirmationModal';

import { ReactComponent as EditIconSVG } from '../../assets/icons/edit.svg';
import { ReactComponent as SignOutIconSVG } from '../../assets/icons/sign-out.svg';
import { ReactComponent as JiraLogoSVG } from '../../assets/icons/jira.svg';

import type { UserType } from '../../types/commonTypes';

import './UserProfile.scss';

type UserProfileProps = {
    className?: string;
    user: UserType;
    changeUserType?: boolean;
}

export const UserProfile = ({ className, user, changeUserType }: UserProfileProps) => {
    const dispatch = useTypedDispatch();
    const { rerender } = useRerenderComponent();
    const { sessionId } = useParams<{ sessionId: string }>();

    const [updatedUsername, setUpdatedUsername] = useState(user.name);
    const [isSelectTeamModalVisible, setIsSelectTeamModalVisible] = useState(false);
    const [isSignOutConfirmModalVisible, setIsSignOutConfirmModalVisible] = useState(false);
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

    const handleSignOut = () => {
        localStorage.clear()

        const [,, sessionId] = window.location.pathname.split('/');

        const redirectPath = sessionId
            ? `/join/${sessionId}`
            : '/'

        window.location.replace(`${window.location.origin}${redirectPath}`);
    }

    const handleAuthJira = async () => {
        await jira.auth(user.id);
        rerender();
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

            <div className="options-list">
                {changeUserType && (
                    <span className="list-option" onClick={handleClickRoleButton}>
                        {user.isSpectator ? 'Join as a player' : 'Become a viewer'}
                    </span>
                )}

                {changeUserType && user.team && (
                    <div className="list-option" onClick={() => setIsSelectTeamModalVisible(true)}>
                        <span>Change team</span>
                    </div>
                )}

                {!jira.authorized && (
                    <div className="list-option" onClick={handleAuthJira}>
                        <span>Authenticate with Jira</span>
                        <JiraLogoSVG />
                    </div>
                )}

                <div className="list-option danger" onClick={() => setIsSignOutConfirmModalVisible(true)}>
                    <span>Sign Out</span>
                    <SignOutIconSVG />
                </div>
            </div>

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

            {isSignOutConfirmModalVisible && (
                <DetachedConfirmationModal
                    dangerous
                    title="Signing out"
                    acceptLabel="Sign out"
                    className="user-profile__confirm-modal"
                    onAccept={handleSignOut}
                    onCancel={() => setIsSignOutConfirmModalVisible(false)}
                >
                    <span>
                        Are you sure you want to sign out?
                        <br />
                        {!user.email && 'You are currently using a temporary account.\nYou will not be able to log into this account again!'}
                    </span>
                </DetachedConfirmationModal>
            )}
        </Popup>
    )
}
