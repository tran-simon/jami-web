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
import { jwtVerify } from 'jose';
import { Container } from 'typedi';

import { StatusCode } from '../constants.js';
import { Vault } from '../vault.js';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const publicKey = Container.get(Vault).publicKey;

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(StatusCode.UNAUTHORIZED).send('Missing Authorization header');
    return;
  }

  const token = authorizationHeader.split(' ')[1];
  if (token === undefined) {
    res.status(StatusCode.BAD_REQUEST).send('Missing JSON web token');
    return;
  }

  try {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'urn:example:issuer',
      audience: 'urn:example:audience',
    });
    res.locals.accountId = payload.id as string;
    next();
  } catch (err) {
    res.sendStatus(StatusCode.UNAUTHORIZED);
  }
}
