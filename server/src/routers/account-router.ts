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
import { AccountDetails } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const accountRouter = Router();

accountRouter.use(authenticateToken);

// TODO: If tokens can be generated on one daemon and used on another (transferrable between daemons),
// then add middleware to check that the currently logged-in accountId is stored in this daemon instance

accountRouter.get('/', (_req, res) => {
  const accountId = res.locals.accountId;

  res.json({
    id: accountId,
    details: jamid.getAccountDetails(accountId),
    volatileDetails: jamid.getVolatileAccountDetails(accountId),
    defaultModerators: jamid.getDefaultModerators(accountId),
    devices: jamid.getDevices(accountId),
  });
});

accountRouter.post('/', (req, res) => {
  const accountId = res.locals.accountId;
  const currentAccountDetails = jamid.getAccountDetails(accountId);
  const newAccountDetails: AccountDetails = { ...currentAccountDetails, ...req.body };
  jamid.setAccountDetails(res.locals.accountId, newAccountDetails);
  res.end();
});
