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
import argon2 from 'argon2';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ParamsDictionary, Request } from 'express-serve-static-core';
import { HttpStatusCode } from 'jami-web-common';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { Accounts } from '../storage/accounts.js';
import { signJwt } from '../utils/jwt.js';

interface Credentials {
  username: string;
  password: string;
}

const jamid = Container.get(Jamid);
const accounts = Container.get(Accounts);

export const authRouter = Router();

authRouter.post(
  '/new-account',
  asyncHandler(async (req: Request<ParamsDictionary, string, Partial<Credentials>>, res, _next) => {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
      res.status(HttpStatusCode.BadRequest).send('Missing username or password in body');
      return;
    }

    if (password === '') {
      res.status(HttpStatusCode.BadRequest).send('Password may not be empty');
      return;
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    // TODO: add JAMS support
    // managerUri: 'https://jams.savoirfairelinux.com',
    // managerUsername: data.username,
    const accountId = await jamid.addAccount(new Map());

    const state = await jamid.registerUsername(accountId, username, '');
    if (state !== 0) {
      jamid.removeAccount(accountId);
      if (state === 2) {
        res.status(HttpStatusCode.BadRequest).send('Invalid username or password');
      } else if (state === 3) {
        res.status(HttpStatusCode.Conflict).send('Username already exists');
      } else {
        throw new Error(`Unhandled state ${state}`);
      }
      return;
    }

    accounts.set(username, hashedPassword);
    await accounts.save();

    res.sendStatus(HttpStatusCode.Created);
  })
);

authRouter.post(
  '/login',
  asyncHandler(
    async (req: Request<ParamsDictionary, { accessToken: string } | string, Partial<Credentials>>, res, _next) => {
      const { username, password } = req.body;
      if (username === undefined || password === undefined) {
        res.status(HttpStatusCode.BadRequest).send('Missing username or password in body');
        return;
      }

      // Check if the account is stored stored on this daemon instance
      const accountId = jamid.getAccountIdFromUsername(username);
      if (accountId === undefined) {
        res.status(HttpStatusCode.NotFound).send('Username not found');
        return;
      }

      const hashedPassword = accounts.get(username);
      if (hashedPassword === undefined) {
        res
          .status(HttpStatusCode.NotFound)
          .send('Password not found (the account does not have a password set on the server)');
        return;
      }

      const isPasswordVerified = await argon2.verify(hashedPassword, password);
      if (!isPasswordVerified) {
        res.status(HttpStatusCode.Unauthorized).send('Incorrect password');
        return;
      }

      const jwt = await signJwt(accountId);
      res.send({ accessToken: jwt });
    }
  )
);
