import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';
import { Router } from 'express';

import { prisma, getRegularModelFields } from '../../datasources/prisma.js';
import { SocketContainer } from '../../socket/socketContainer.js';
import { UserType } from '../../types/commonTypes.js';

export const userRouter = Router();

const userModelFields = getRegularModelFields('User').fields;
const getCleanUserObject = (user: Record<string, unknown>) => lodash.pick(user, ...userModelFields) as UserType;


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
                ...getCleanUserObject(body),
                id: nanoid(),
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

userRouter.post('/update-self', async (req, res) => {
    const authToken = req.headers.authorization

    if (!authToken) {
        res.status(401);
        return res.json({ error: 'User token required' });
    }

    let decodedToken: UserType

    try {
        decodedToken = jwt.verify(authToken, process.env.SECRET!) as UserType;
    } catch (e: unknown) {
        res.status(401);
        return res.json({ error: 'User token is not valid' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: decodedToken.id },
            data: lodash.omit(getCleanUserObject(req.body), 'id'),
            include: { sessions: true }
        })

        const cleanUser = getCleanUserObject(updatedUser);

        if (SocketContainer.socket && !lodash.isEmpty(updatedUser.sessions)) {
            const sessionIds = updatedUser.sessions.map(({ id }) => id);

            SocketContainer.socket.to(sessionIds).emit('receive-updated-user', cleanUser);
        }

        const token = jwt.sign(cleanUser, process.env.SECRET!)

        res.status(200);
        res.json({
            token,
            user: updatedUser,
        });
    } catch (e: unknown) {
        console.error(e)
        res.status(500);
        res.json({ error: e })
    }
})
