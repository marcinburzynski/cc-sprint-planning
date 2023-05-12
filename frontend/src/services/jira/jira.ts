import { JiraBase } from './jira.base';

import type {
    JiraBoardsRes,
    JiraIssuesRes,
    JiraSprintsRes,
    JiraIssueWithDetails,
} from './jira.types'

export type GetIssuesSearchParams = {
    searchText?: string;
    boardId?: number;
    sprintId?: number;
    startAt?: number;
}

class Jira extends JiraBase {

    getIssues = async (params: GetIssuesSearchParams) => {
        const client = await this.getAuthedClient();

        if (!params.boardId && !params.sprintId) {
            throw new Error('getIssues failed. Neither boardId nor sprintId was specified. At least one is required.')
        }

        let url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/board/${params.boardId}/issue`)

        if (params.sprintId) {
            url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/sprint/${params.sprintId}/issue`);
        }

        let jql = 'summary IS NOT EMPTY ORDER BY updatedDate';

        const jiraKeyRegex = new RegExp(/^[A-Z]{2,10}-\d{1,9}/);

        if (params.searchText) {
            jql = `summary ~ "${params.searchText}"`;

            const isJiraKey = jiraKeyRegex.test(params.searchText);
            if (isJiraKey) {
                jql = `key = ${params.searchText}`;
            }

            jql += ' ORDER BY updatedDate';
        }

        url.searchParams.append('jql', jql);

        if (params.startAt) {
            url.searchParams.append('startAt', `${params.startAt}`);
        }

        const fields = [
            'created', 'description', 'summary', 'updated', 'issuetype', 'assignee', 'parent', 'status',
        ]

        fields.forEach((field) => url.searchParams.append('fields', field));


        return client.get<JiraIssuesRes>(url.toString());
    }

    getAllBoards = async (startAt?: number) => {
        const client = await this.getAuthedClient();

        const url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/board`);
        url.searchParams.append('type', 'scrum');

        if (startAt) {
            url.searchParams.append('startAt', `${startAt}`);
        }

        return client.get<JiraBoardsRes>(url.toString());
    }

    getSprintsFromBoard = async (boardId: number) => {
        const client = await this.getAuthedClient();

        const url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/board/${boardId}/sprint`)
        url.searchParams.append('state', 'active,future')

        return client.get<JiraSprintsRes>(url.toString());
    }

    getImage = async (url: string) => {
        const client = await this.getAuthedClient();

        const { data } = await client.get(url, { responseType: 'blob' });
        const reader = new FileReader();
        reader.readAsDataURL(data);

        return new Promise<string>((resolve) => {
            reader.onload = () => {
                resolve(reader.result as string);
            };
        })
    };

    setEstimate = async (boardId: number, issueKey: string, estimate: string) => {
        const client = await this.getAuthedClient();

        const url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/agile/1.0/issue/${issueKey}/estimation`)
        url.searchParams.append('boardId', `${boardId}`);

        return client.put(url.toString(), { value: estimate });
    }


    getIssue = async (issueKey: string) => {
        const client = await this.getAuthedClient();

        const url = new URL(`https://api.atlassian.com/ex/jira/${this.cloudId}/rest/api/2/issue/${issueKey}`)
        url.searchParams.append('expand', 'renderedFields')

        const fields = [
            'created', 'creator', 'comment', 'description', 'summary', 'updated', 'issuetype', 'assignee',
            'attachment', 'parent', 'priority', 'status', 'project', 'reporter'
        ]

        fields.forEach((field) => url.searchParams.append('fields', field));

        return client.get<JiraIssueWithDetails>(url.toString())
    }
}


export const jira = new Jira();
