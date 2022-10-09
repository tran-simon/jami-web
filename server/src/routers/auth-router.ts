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
import { SignJWT } from 'jose';
import log from 'loglevel';
import { Service } from 'typedi';

import { StatusCode } from '../constants.js';
import { Creds } from '../creds.js';
import { Jamid } from '../jamid.js';
import { Vault } from '../vault.js';

interface Credentials {
  username?: string;
  password?: string;
}

@Service()
export class AuthRouter {
  constructor(private readonly jamid: Jamid, private readonly creds: Creds, private readonly vault: Vault) {}

  async build() {
    const router = Router();

    const privKey = await this.vault.privKey();

    router.post(
      '/new-account',
      asyncHandler(async (req: Request<ParamsDictionary, any, Credentials>, res, _next) => {
        const { username, password } = req.body;
        if (!username || !password) {
          res.status(StatusCode.BAD_REQUEST).send('Missing username or password');
          return;
        }

        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

        // TODO: add JAMS support
        // managerUri: 'https://jams.savoirfairelinux.com',
        // managerUsername: data.username,
        // TODO: find a way to store the password directly in Jami
        // Maybe by using the "password" field? But as I tested, it's not
        // returned when getting user infos.
        const { accountId } = await this.jamid.createAccount(new Map());

        // TODO: understand why the password arg in this call must be empty
        const { state } = await this.jamid.registerUsername(accountId, username, '');
        if (state !== 0) {
          this.jamid.destroyAccount(accountId);
          if (state === 2) {
            res.status(StatusCode.BAD_REQUEST).send('Invalid username or password');
          } else if (state === 3) {
            res.status(StatusCode.CONFLICT).send('Username already exists');
          } else {
            log.error(`POST - Unhandled state ${state}`);
            res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR);
          }
          return;
        }

        this.creds.set(username, hashedPassword);
        await this.creds.save();

        res.sendStatus(StatusCode.CREATED);
      })
    );

    router.post(
      '/login',
      asyncHandler(async (req: Request<ParamsDictionary, any, Credentials>, res, _next) => {
        const { username, password } = req.body;
        if (!username || !password) {
          res.status(StatusCode.BAD_REQUEST).send('Missing username or password');
          return;
        }

        // The account may either be:
        // 1. not be found
        // 2. found but not on this instance (but I'm not sure about this)
        const accountId = this.jamid.usernameToAccountId(username);
        if (accountId === undefined) {
          res.status(StatusCode.NOT_FOUND).send('Username not found');
          return;
        }

        // TODO: load the password from Jami
        const hashedPassword = this.creds.get(username);
        if (!hashedPassword) {
          res.status(StatusCode.NOT_FOUND).send('Password not found');
          return;
        }

        log.debug(this.jamid.getAccountDetails(accountId));

        const isPasswordVerified = await argon2.verify(hashedPassword, password);
        if (!isPasswordVerified) {
          res.sendStatus(StatusCode.UNAUTHORIZED);
          return;
        }

        const jwt = await new SignJWT({ id: accountId })
          .setProtectedHeader({ alg: 'EdDSA' })
          .setIssuedAt()
          // TODO: use valid issuer and andiance
          .setIssuer('urn:example:issuer')
          .setAudience('urn:example:audience')
          .setExpirationTime('2h')
          .sign(privKey);
        res.json({ accessToken: jwt });
      })
    );

    return router;
  }
}
