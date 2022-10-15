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
import { Service } from 'typedi';

import { StatusCode } from '../constants.js';

@Service()
class AuthRouter {
  async build() {
    const router = Router();

    router.post(
      '/new-account',
      asyncHandler(async (_req, res, _next) => {
        await Promise.resolve(42);
        res.sendStatus(StatusCode.NOT_IMPLEMENTED);
      })
    );

    router.post(
      '/login',
      asyncHandler(async (_req, res, _next) => {
        await Promise.resolve(42);
        res.sendStatus(StatusCode.NOT_IMPLEMENTED);
      })
    );

    return router;
  }
}

export { AuthRouter };
