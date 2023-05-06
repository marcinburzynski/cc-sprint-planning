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

export type JiraIncludedAccountRef = {
    accountId: string;
    displayName: string;
    accountType: string;
    emailAddress?: string;
    active: boolean;
    avatarUrls: JiraIconsSet;
    self: string;
    timeZone: string;
}

export type JiraIssueStatus = {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    self: string;
}

export type JiraIssueFieldsShort = {
    created: string;
    description: string;
    summary: string;
    updated: string;
    issuetype: JiraIssueType;
    assignee: JiraIncludedAccountRef | null;
    parent?: {
        id: string;
        key: string;
        self: string;
        fields: {
            issuetype: JiraIssueType;
            summary: string;
        };
    };
    status: JiraIssueStatus;
};

export type JiraIssueGeneric<F> = {
    id: string;
    key: string;
    self: string;
    expand: string;
    fields: F
}

export type JiraIssue = JiraIssueGeneric<JiraIssueFieldsShort>

export type JiraIssuesRes = {
    expand: string;
    maxResults: number;
    startAt: number;
    total: number;
    issues: JiraIssue[];
}

export type JiraAttachment = {
    id: string;
    filename: string;
    author: JiraIncludedAccountRef;
    content: string;
    created: string;
    mimeType: string;
    self: string;
    size: number;
}

export type JiraComment = {
    id: string;
    self: string;
    created: string;
    updated: string;
    jsdPublic: boolean;
    author: JiraIncludedAccountRef;
    updateAuthor: JiraIncludedAccountRef;
    body: string;
}

export type JiraPriority = {
    id: string;
    name: string;
    iconUrl: string;
    self: string;
}

export type JiraProject = {
    id: string;
    key: string;
    name: string;
    self: string;
    simplified: boolean;
    projectTypeKey: string;
    avatarUrls: JiraIconsSet;
}

export type JiraExtendedIssueStatus = JiraIssueStatus & {
    statusCategory: {
        id: number;
        key: string;
        name: string;
        colorName: string;
        self: string;
    }
}

export type ExtendedJiraIssueFields = Omit<JiraIssueFieldsShort, 'status'> & {
    attachment: JiraAttachment[];
    comment: {
        maxResults: number;
        startAt: number;
        total: number;
        self: string;
        comments: JiraComment[];
    };
    creator: JiraIncludedAccountRef;
    priority: JiraPriority;
    project: JiraProject;
    reporter: JiraIncludedAccountRef;
    status: JiraExtendedIssueStatus;
}

export type JiraIssueWithDetails = JiraIssueGeneric<ExtendedJiraIssueFields> & {
    renderedFields: ExtendedJiraIssueFields;
}

export type JiraSprint = {
    id: number;
    state: string;
    name: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
    goal?: string;
    self: string;
}

export type JiraSprintsRes = {
    maxResults: number;
    startAt: number;
    total: number;
    isLast: boolean;
    values: JiraSprint[];
}
