import axios from 'axios';
import type { Team } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { Router } from 'express';
import { URL } from 'url';
import { prisma } from '../../datasources/prisma.js';

export const googleRouter = Router();

type GoogleOauthTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
}

type DecodedGoogleIDToken = {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    at_hash: string;
    name: string;
    picture?: string;
    given_name: string;
    family_name: string;
    locale: string;
    iat: number;
    exp: number;
}

googleRouter.post('/auth', async (req, res) => {
    if (!req.body.code) {
        res.status(400);
        return res.json({ error: 'code is required' })
    }

    try {
        const url = new URL('https://oauth2.googleapis.com/token')
        const params = {
            'grant_type': 'authorization_code',
            'client_id': process.env.GOOGLE_CLIENT_ID,
            'client_secret': process.env.GOOGLE_CLIENT_SECRET,
            'redirect_uri': `${process.env.APP_HOST}/google-oauth`,
            'code': req.body.code,
        }

        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        const { data } = await axios.post<GoogleOauthTokenResponse>(url.toString())

        const decodedData = jwt.decode(data.id_token) as DecodedGoogleIDToken;

        if (!decodedData.email_verified) {
            res.status(401);
            return res.json({ error: 'Google account email has to be verified' });
        }

        const foundUser = await prisma.user.findUnique({ where: { email: decodedData.email } })

        if (foundUser) {
            res.status(200);
            return res.json({ token: jwt.sign(foundUser, process.env.SECRET!) })
        }

        let teams: Team[] | undefined;

        if (req.body.sessionId) {
            teams = await prisma.team.findMany({ where: { sessionId: req.body.sessionId }})
        }

        const createdUser = await prisma.user.create({
            data: {
                id: nanoid(),
                email: decodedData.email,
                name: `${decodedData.given_name} ${decodedData.family_name}`,
                team: teams ? teams[0].name : undefined,
                isAdmin: !req.body.sessionId,
                isSpectator: !req.body.sessionId,
                sessions: req.body.sessionId
                    ? { connect: [{ id: req.body.sessionId }] }
                    : undefined,
            }
        })

        res.status(200);
        res.json({ token: jwt.sign(createdUser, process.env.SECRET!) });
    } catch (e: unknown) {
        res.status(500);
        res.json({ error: e });
    }
})