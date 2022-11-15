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
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'jami-web-common';

import { verifyJwt } from '../utils/jwt.js';

function createAuthenticationMiddleware(isAuthenticationRequired: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      if (isAuthenticationRequired) {
        res.status(HttpStatusCode.Unauthorized).send('Missing Authorization header');
      } else {
        // Skip authentication if it is optional, in which case the Authorization header should not have been set
        res.locals.accountId = undefined;
        next();
      }
      return;
    }

    const token = authorizationHeader.split(' ')[1];
    if (token === undefined) {
      res.status(HttpStatusCode.BadRequest).send('Missing JSON web token');
      return;
    }

    try {
      const { payload } = await verifyJwt(token);
      res.locals.accountId = payload.accountId;
      next();
    } catch (e) {
      res.status(HttpStatusCode.Unauthorized).send('Invalid access token');
    }
  };
}

export const authenticateToken = createAuthenticationMiddleware(true);

export const authenticateOptionalToken = createAuthenticationMiddleware(false);
