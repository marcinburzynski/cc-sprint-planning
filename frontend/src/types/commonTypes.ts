export type UserType = {
    id: string;
    name: string;
    isSpectator: boolean;
    team?: string;
}

export type TicketType = {
    id: string;
    name: string;
    isRevealed?: boolean;
}

export type EstimationType = {
    ticketId: string;
    userId: string;
    value: string | null;
}
