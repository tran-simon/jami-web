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
import { Request, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ParamsDictionary } from 'express-serve-static-core';
import { AccountDetails, HttpStatusCode, IAccount, IContact } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const accountRouter = Router();

accountRouter.use(authenticateToken);

// TODO: Do we really need this route to return the default moderators?
// It would be cleaner just to GET /default-moderators for this
accountRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const accountId = res.locals.accountId;

    // Add usernames for default moderators
    const defaultModeratorUris = jamid.getDefaultModeratorUris(accountId);
    const namedDefaultModerators: IContact[] = [];
    for (const defaultModeratorUri of defaultModeratorUris) {
      const { username } = await jamid.lookupAddress(defaultModeratorUri, accountId);
      namedDefaultModerators.push({
        uri: defaultModeratorUri,
        registeredName: username,
      });
    }

    const account: IAccount = {
      id: accountId,
      details: jamid.getAccountDetails(accountId),
      volatileDetails: jamid.getVolatileAccountDetails(accountId),
      defaultModerators: namedDefaultModerators,
      devices: jamid.getDevices(accountId),
    };
    res.send(account);
  })
);

accountRouter.patch('/', (req: Request<ParamsDictionary, string, Partial<AccountDetails>>, res) => {
  const accountId = res.locals.accountId;

  const currentAccountDetails = jamid.getAccountDetails(accountId);
  const newAccountDetails: AccountDetails = { ...currentAccountDetails, ...req.body };
  jamid.setAccountDetails(accountId, newAccountDetails);

  res.sendStatus(HttpStatusCode.NoContent);
});
