import https from 'https';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';

import { initSocket } from './socket/initSocket.js';
import { initHTTP } from './http/initHTTP.js';
import { SocketContainer } from './socket/socketContainer.js';

const corsOrigin = process.env.DEV ? '*' : 'https://cc-planning.stormymood.me'

const main = async () => {
    const privateKey = fs.readFileSync('/ssl/privkey.pem').toString();
    const certificate = fs.readFileSync('/ssl/fullchain.pem').toString();

    const app = express();
    app.use(cors({ origin: corsOrigin }));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    const server = https.createServer({
        key: privateKey,
        cert: certificate,
        requestCert: false,
        rejectUnauthorized: false,
    }, app);

    SocketContainer.socket = new Server(server, { cors: { origin: corsOrigin } });

    initHTTP(app);
    initSocket(SocketContainer.socket);

    server.listen(443)
};

main();
