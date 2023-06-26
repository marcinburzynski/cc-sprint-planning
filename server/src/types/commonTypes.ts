export type UserType = {
    id: string;
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

export type EstimationType = {
    ticketId: string;
    userId: string;
    value: string | null;
}

export type PromiseCallback = (params?: unknown) => void
