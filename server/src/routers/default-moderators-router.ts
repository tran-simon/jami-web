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
import { HttpStatusCode, IContact } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { authenticateToken } from '../middleware/auth.js';

const jamid = Container.get(Jamid);

export const defaultModeratorsRouter = Router();

defaultModeratorsRouter.use(authenticateToken);

defaultModeratorsRouter.get(
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

    res.send(namedDefaultModerators);
  })
);

defaultModeratorsRouter.put('/:contactId', (req, res) => {
  jamid.addDefaultModerator(res.locals.accountId, req.params.contactId);
  res.sendStatus(HttpStatusCode.NoContent);
});

defaultModeratorsRouter.delete('/:contactId', (req, res) => {
  jamid.removeDefaultModerator(res.locals.accountId, req.params.contactId);
  res.sendStatus(HttpStatusCode.NoContent);
});
