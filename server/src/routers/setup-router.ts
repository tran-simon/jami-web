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

import { AdminConfig } from '../admin-config.js';
import { checkAdminSetup } from '../middleware/setup.js';
import { Vault } from '../vault.js';

export const setupRouter = Router();

const vault = Container.get(Vault);
const adminConfig = Container.get(AdminConfig);

setupRouter.get('/check', (_req, res, _next) => {
  const isSetupComplete = adminConfig.get() !== undefined;
  res.send({ isSetupComplete });
});

setupRouter.post(
  '/admin/create',
  asyncHandler(async (req: Request<ParamsDictionary, string, { password?: string }>, res, _next) => {
    const isAdminCreated = adminConfig.get() !== undefined;
    if (isAdminCreated) {
      res.sendStatus(HttpStatusCode.BadRequest);
      return;
    }

    const { password } = req.body;
    if (!password) {
      res.status(HttpStatusCode.BadRequest).send('Missing password');
      return;
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
    adminConfig.set(hashedPassword);
    await adminConfig.save();

    res.sendStatus(HttpStatusCode.Created);
  })
);

// Every request handler after this line will be submitted to this middleware
// in order to ensure that the admin account is set up before proceeding with
// setup related requests.
setupRouter.use(checkAdminSetup);

setupRouter.post(
  '/admin/login',
  asyncHandler(
    async (req: Request<ParamsDictionary, { accessToken: string } | string, { password: string }>, res, _next) => {
      const { password } = req.body;
      if (!password) {
        res.status(HttpStatusCode.BadRequest).send('Missing password');
        return;
      }

      const hashedPassword = adminConfig.get();
      const isPasswordVerified = await argon2.verify(hashedPassword, password);
      if (!isPasswordVerified) {
        res.sendStatus(HttpStatusCode.Forbidden);
        return;
      }

      const jwt = await new SignJWT({ id: 'admin' })
        .setProtectedHeader({ alg: 'EdDSA' })
        .setIssuedAt()
        // TODO: use valid issuer and audience
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('2h')
        .sign(vault.privateKey);
      res.send({ accessToken: jwt });
    }
  )
);
