import axios from 'axios';
import { Router } from 'express';

export const jiraRouter = Router();

jiraRouter.post('/get-auth-token', async (req, res) => {
    try {
        const { data } = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            code: req.body.oauthToken,
            redirect_uri: `${process.env.APP_HOST}/jira-oauth`,
        });

        res.json(data);
    } catch (e) {
        res.status(500);
        res.json({ error: e });
    }
})

jiraRouter.post('/refresh-token', async (req, res) => {
    try {
        const { data } = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'refresh_token',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            refresh_token: req.body.refreshToken,
        });

        res.json(data);
    } catch (e) {
        res.status(500);
        res.json({ error: e })
    }
})
