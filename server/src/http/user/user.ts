import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

import { prisma } from '../../datasources/prisma.js';

export const userRouter = Router();

userRouter.post('/create', async (req, res) => {
    if (!req.body?.name) {
        res.status(400);
        return res.json({ error: 'username field is required' });
    }

    if (!req.body?.team && !req.body?.isSpectator) {
        res.status(400);
        return res.json({ error: 'team field or isSpectator flag is required' });
    }

    const user = await prisma.user.create({
        data: {
            id: nanoid(),
            name: req.body.name,
            team: req.body.team,
            isSpectator: req.body.isSpectator || false,
        }
    });

    const token = jwt.sign(user, process.env.SECRET!);

    res.json({ token });
});
