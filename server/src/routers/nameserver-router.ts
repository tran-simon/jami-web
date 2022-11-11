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
import asyncHandler from 'express-async-handler';
import { HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateOptionalToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const nameserverRouter = Router();

nameserverRouter.use(authenticateOptionalToken);

nameserverRouter.get(
  '/username/:username',
  asyncHandler(async (req, res) => {
    const result = await jamid.lookupUsername(req.params.username, res.locals.accountId);
    switch (result.state) {
      case 0:
        res.send(result);
        break;
      case 1:
        res.status(HttpStatusCode.BadRequest).send('Invalid username');
        break;
      default:
        res.status(HttpStatusCode.NotFound).send('No such username found');
        break;
    }
  })
);

nameserverRouter.get(
  '/address/:address',
  asyncHandler(async (req, res) => {
    const result = await jamid.lookupAddress(req.params.address, res.locals.accountId);
    switch (result.state) {
      case 0:
        res.send(result);
        break;
      case 1:
        res.status(HttpStatusCode.BadRequest).send('Invalid address');
        break;
      default:
        res.status(HttpStatusCode.NotFound).send('No such address found');
        break;
    }
  })
);
