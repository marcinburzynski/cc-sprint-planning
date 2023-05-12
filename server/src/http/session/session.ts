import { nanoid } from 'nanoid';
import { Router } from 'express';

import { prisma } from '../../datasources/prisma.js';

export const sessionRouter = Router();

sessionRouter.post('/create', async (req, res) => {
    if (!req.body?.teams || !req.body?.teams.length || !req.body?.deck) {
        res.status(400);
        return res.json({ error: 'Teams field is required and cannot be empty' });
    }

    const session = await prisma.session.create({
        data: {
            id: nanoid(),
            deck: req.body.deck,
        }
    });

    await prisma.team.createMany({
        data: req.body.teams.map((team: string) => ({
            sessionId: session.id,
            name: team,
        })),
    });

    res.json({ session });
});

sessionRouter.get('/:sessionId/teams', async (req, res) => {
    const teams = await prisma.team.findMany({ where: { sessionId: req.params.sessionId } });

    res.json({ teams: teams.map((team) => team.name) });
});
