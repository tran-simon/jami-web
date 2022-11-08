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
import { Container } from 'typedi';

import { AdminConfig } from '../admin-config.js';

const adminConfig = Container.get(AdminConfig);

export async function checkAdminSetup(_req: Request, res: Response, next: NextFunction) {
  const isSetupComplete = adminConfig.get() !== undefined;

  if (!isSetupComplete) {
    res.sendStatus(HttpStatusCode.Forbidden);
    return;
  }
  next();
}
