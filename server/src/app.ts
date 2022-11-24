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

import { checkAdminSetup } from './middleware/setup.js';
import { accountRouter } from './routers/account-router.js';
import { authRouter } from './routers/auth-router.js';
import { callRouter } from './routers/call-router.js';
import { contactsRouter } from './routers/contacts-router.js';
import { conversationRouter } from './routers/conversation-router.js';
import { defaultModeratorsRouter } from './routers/default-moderators-router.js';
import { nameserverRouter } from './routers/nameserver-router.js';
import { setupRouter } from './routers/setup-router.js';
import { bindWebRtcCallbacks } from './websocket/webrtc-handler.js';

@Service()
export class App {
  app = express();

  constructor() {
    // Setup middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(json());

    // Enforce admin setup
    this.app.use('/setup', setupRouter);
    this.app.use(checkAdminSetup);

    // Setup routing
    this.app.use('/auth', authRouter);
    this.app.use('/account', accountRouter);
    this.app.use('/contacts', contactsRouter);
    this.app.use('/default-moderators', defaultModeratorsRouter);
    this.app.use('/conversations', conversationRouter);
    this.app.use('/calls', callRouter);
    this.app.use('/ns', nameserverRouter);

    // Setup WebSocket callbacks
    bindWebRtcCallbacks();

    // Setup 404 error handling
    this.app.use((_req, res) => {
      res.sendStatus(HttpStatusCode.NotFound);
    });

    // Setup internal error handling
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      log.error(err);
      res.status(HttpStatusCode.InternalServerError).send(err.message);
    });
  }
}
