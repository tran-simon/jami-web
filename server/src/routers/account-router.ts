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
import { Router } from 'express';
import log from 'loglevel';
import { Container } from 'typedi';

import { Jamid } from '../jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const accountRouter = Router();

accountRouter.get('/', authenticateToken, (req, res) => {
  log.debug('TODO: Implement jamid.getAccount()');
  res.send(`TODO: ${req.method} ${req.originalUrl} for account ID ${res.locals.accountId}`);
});

accountRouter.post('/', authenticateToken, (req, res) => {
  log.debug('TODO: Implement jamid.getAccount().updateDetails()');
  res.send(`TODO: ${req.method} ${req.originalUrl} for account ID ${res.locals.accountId}`);
});
