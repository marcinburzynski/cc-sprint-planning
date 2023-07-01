import type { RequiredBy } from './utilTypes';

export type UserType = {
    id: string;
    email?: string;
    name: string;
    isSpectator: boolean;
    isAdmin: boolean;
    team?: string;
}

export type TicketType = {
    id: string;
    name: string;
    order: number;
    issueKey?: string;
    issueUrl?: string;
    isRevealed?: boolean;
}

export type JiraTicketType = RequiredBy<TicketType, 'issueKey'>;

export type EstimationType = {
    ticketId: string;
    userId: string;
    value: string | null;
}

export type EstimateCardType = {
    label: string;
    value: number;
    type: 'story-points' | 'time' | 'utility';
}

export type SessionType = {
    id: string;
    deck: EstimateCardType[];
}
