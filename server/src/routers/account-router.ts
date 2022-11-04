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
import { AccountDetails, AccountTextMessage, HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const accountRouter = Router();

accountRouter.use(authenticateToken);

// TODO: If tokens can be generated on one daemon and used on another (transferrable between daemons),
// then add middleware to check that the currently logged-in accountId is stored in this daemon instance

// TODO: Do we really need this route to return the default moderators?
// It would be cleaner just to GET /default-moderators for this
accountRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const accountId = res.locals.accountId;

    // Add usernames for default moderators
    const defaultModeratorUris = jamid.getDefaultModeratorUris(accountId);
    const namedDefaultModerators = [];
    for (const defaultModeratorUri of defaultModeratorUris) {
      const { username } = await jamid.lookupAddress(defaultModeratorUri, accountId);
      namedDefaultModerators.push({
        uri: defaultModeratorUri,
        registeredName: username,
      });
    }

    res.json({
      id: accountId,
      details: jamid.getAccountDetails(accountId),
      volatileDetails: jamid.getVolatileAccountDetails(accountId),
      defaultModerators: namedDefaultModerators,
      devices: jamid.getDevices(accountId),
    });
  })
);

accountRouter.patch('/', (req, res) => {
  const accountId = res.locals.accountId;
  const currentAccountDetails = jamid.getAccountDetails(accountId);
  const newAccountDetails: AccountDetails = { ...currentAccountDetails, ...req.body };
  jamid.setAccountDetails(res.locals.accountId, newAccountDetails);
  res.sendStatus(HttpStatusCode.NoContent);
});

accountRouter.post('/send-account-message', (req: Request<ParamsDictionary, any, AccountTextMessage>, res) => {
  const { from, to, message } = req.body;
  if (!from || !to || !message) {
    res.status(HttpStatusCode.BadRequest).send('Missing arguments in request');
    return;
  }
  jamid.sendAccountTextMessage(from, to, JSON.stringify(message));
  res.end();
});
