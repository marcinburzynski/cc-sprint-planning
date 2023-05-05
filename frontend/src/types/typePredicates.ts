import type { UserType, TicketType, JiraTicketType } from './commonTypes';

export const isCompleteUser = (user: Partial<UserType>): user is UserType => !!(
    user.name && user.id
);

export const isJiraTicket = (ticket: TicketType): ticket is JiraTicketType => 'issueKey' in ticket;
