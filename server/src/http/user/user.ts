import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

import { prisma } from '../../datasources/prisma.js';

export const userRouter = Router();

userRouter.post('/create', async (req, res) => {
    const { body } = req;

    if (!body.name) {
        res.status(400);
        return res.json({ error: 'Username field is required' });
    }

    if (!body.isSpectator && !body.team) {
        res.status(400);
        return res.json({ error: 'When user is not a spectator, team selection is required' });
    }

    try {
        const user = await prisma.user.create({
            data: {
                id: nanoid(),
                name: body.name,
                team: body.team,
                isSpectator: body.isSpectator || false,
                isAdmin: body.isAdmin || false,
            }
        });

        const token = jwt.sign(user, process.env.SECRET!);

        res.json({ token });
    } catch (e) {
        res.status(500);
        res.json({ error: e });
    }
});
