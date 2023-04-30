export type JiraAccessTokenRes = {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export type JiraResource = {
    id: string;
    avatarUrl: string;
    name: string;
    scopes: string[];
    url: string;
}

export type JiraBoard = {
    id: number;
    name: string;
    self: string;
    type: string;
    location: {
        avatarURI: string;
        displayName: string;
        name: string;
        projectId: number;
        projectKey: string;
        projectName: string;
        projectTypeKey: string;
    };
}

export type JiraBoardsRes = {
    isLast: boolean;
    maxResults: number;
    startAt: number;
    total: number;
    values: JiraBoard[];
}

export type JiraIssueType = {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    avatarId: number;
    hierarchyLevel: number;
    self: string;
    subtask: boolean;
}

export type JiraIconsSet<T extends string = '16' | '24' | '32' | '48'> = {
    [R in T as `${R}x${R}`]: string;
}

export type JiraIssue = {
    id: string;
    key: string;
    self: string;
    expand: string;
    fields: {
        created: string;
        description: string;
        summary: string;
        updated: string;
        issuetype: JiraIssueType;
        assignee: {
            accountId: string;
            displayName: string;
            accountType: string;
            active: boolean;
            avatarUrls: JiraIconsSet;
            self: string;
            timeZone: string;
        } | null;
        parent?: {
            id: string;
            key: string;
            self: string;
            fields: {
                issuetype: JiraIssueType;
                summary: string;
            };
        };
        status: {
            id: string;
            name: string;
            description: string;
            iconUrl: string;
            self: string;
        };
    };
}

export type JiraIssuesRes = {
    expand: string;
    maxResults: number;
    startAt: number;
    total: number;
    issues: JiraIssue[];
}
