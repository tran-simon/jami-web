/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import cors from 'cors';
import express, { json, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { HttpStatusCode } from 'jami-web-common';
import log from 'loglevel';
import { Service } from 'typedi';

import { bindWebRTCCallbacks } from './handlers/webrtc-handler.js';
import { checkAdminSetup } from './middleware/setup.js';
import { accountRouter } from './routers/account-router.js';
import { authRouter } from './routers/auth-router.js';
import { callRouter } from './routers/call-router.js';
import { contactsRouter } from './routers/contacts-router.js';
import { conversationRouter } from './routers/conversation-router.js';
import { defaultModeratorsRouter } from './routers/default-moderators-router.js';
import { nameserverRouter } from './routers/nameserver-router.js';
import { setupRouter } from './routers/setup-router.js';

@Service()
export class App {
  async build() {
    const app = express();

    // Setup middleware
    app.use(helmet());
    app.use(cors());
    app.use(json());

    // Enforce admin setup
    app.use('/setup', setupRouter);
    app.use(checkAdminSetup);

    // Setup routing
    app.use('/auth', authRouter);
    app.use('/account', accountRouter);
    app.use('/contacts', contactsRouter);
    app.use('/default-moderators', defaultModeratorsRouter);
    app.use('/conversations', conversationRouter);
    app.use('/calls', callRouter);
    app.use('/ns', nameserverRouter);

    // Setup WebSocket callbacks
    bindWebRTCCallbacks();

    // Setup 404 error handling
    app.use((_req, res) => {
      res.sendStatus(HttpStatusCode.NotFound);
    });

    // Setup internal error handling
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      log.error(err);
      res.status(HttpStatusCode.InternalServerError).send(err.message);
    });

    return app;
  }
}
