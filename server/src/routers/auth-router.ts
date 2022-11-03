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
import { SignJWT } from 'jose';
import { Container } from 'typedi';

import { Creds } from '../creds.js';
import { Jamid } from '../jamid/jamid.js';
import { Vault } from '../vault.js';

interface Credentials {
  username?: string;
  password?: string;
}

const jamid = Container.get(Jamid);
const creds = Container.get(Creds);
const vault = Container.get(Vault);

export const authRouter = Router();

authRouter.post(
  '/new-account',
  asyncHandler(async (req: Request<ParamsDictionary, string, Credentials>, res, _next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(HttpStatusCode.BadRequest).send('Missing username or password');
      return;
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    // TODO: add JAMS support
    // managerUri: 'https://jams.savoirfairelinux.com',
    // managerUsername: data.username,
    // TODO: find a way to store the password directly in Jami
    // Maybe by using the "password" field? But as I tested, it's not
    // returned when getting user infos.
    const accountId = await jamid.addAccount(new Map());

    // TODO: understand why the password arg in this call must be empty
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

    creds.set(username, hashedPassword);
    await creds.save();

    res.sendStatus(HttpStatusCode.Created);
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req: Request<ParamsDictionary, { accessToken: string } | string, Credentials>, res, _next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(HttpStatusCode.BadRequest).send('Missing username or password');
      return;
    }

    // The account may either be:
    // 1. not found
    // 2. found but not on this instance (but I'm not sure about this)
    const accountId = jamid.getAccountIdFromUsername(username);
    if (accountId === undefined) {
      res.status(HttpStatusCode.NotFound).send('Username not found');
      return;
    }

    // TODO: load the password from Jami
    const hashedPassword = creds.get(username);
    if (!hashedPassword) {
      res.status(HttpStatusCode.NotFound).send('Password not found');
      return;
    }

    const isPasswordVerified = await argon2.verify(hashedPassword, password);
    if (!isPasswordVerified) {
      res.sendStatus(HttpStatusCode.Unauthorized);
      return;
    }

    const jwt = await new SignJWT({ id: accountId })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt()
      // TODO: use valid issuer and audience
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime('2h')
      .sign(vault.privateKey);
    res.send({ accessToken: jwt });
  })
);
