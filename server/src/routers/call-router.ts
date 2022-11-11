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
import { HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const callRouter = Router();

callRouter.use(authenticateToken);

callRouter.get('/', (_req, res) => {
  const callIds = jamid.getCallIds(res.locals.accountId);
  res.send(callIds);
});

callRouter.get('/:callId', (req, res) => {
  const callDetails = jamid.getCallDetails(res.locals.accountId, req.params.callId);

  if (Object.keys(callDetails).length === 0) {
    res.status(HttpStatusCode.NotFound).send('No such call found');
    return;
  }

  res.send(callDetails);
});
