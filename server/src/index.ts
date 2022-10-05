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
import 'reflect-metadata';

import { createServer } from 'node:http';

import log from 'loglevel';
import { Container } from 'typedi';

import { Router } from './router.js';
import { Ws } from './ws.js';

log.setLevel(process.env.NODE_ENV === 'production' ? 'error' : 'trace');

const app = await Container.get(Router).build();
const wss = await Container.get(Ws).build();

// Disable HTTP 1.1 Keep-Alive
const server = createServer((_, res) => res.setHeader('Connection', 'close'));
server.on('request', app);
server.on('upgrade', wss);
server.listen({
  host: '0.0.0.0',
  port: 5000,
  exclusive: true,
});

log.debug('Server started (HTTP + WS)');

const closeFn: NodeJS.SignalsListener = (signal) => {
  log.info(signal);
  server.close();
  log.info('server closed');
};
process.once('SIGTERM', closeFn);
process.once('SIGHUP', closeFn);
process.once('SIGINT', closeFn);
