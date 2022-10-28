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
import express, { json, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { HttpStatusCode } from 'jami-web-common';
import log from 'loglevel';
import { Service } from 'typedi';

import { accountRouter } from './routers/account-router.js';
import { authRouter } from './routers/auth-router.js';
import { nameserverRouter } from './routers/nameserver-router.js';

@Service()
export class App {
  async build() {
    const app = express();

    // Setup middleware
    app.use(helmet());
    app.use(json());

    // Setup routing
    app.use('/auth', authRouter);
    app.use('/account', accountRouter);
    app.use('/ns', nameserverRouter);

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
