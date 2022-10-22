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

import { App } from './app.js';
import { Creds } from './creds.js';
import { Jamid } from './jamid/jamid.js';
import { Vault } from './vault.js';
import { Ws } from './ws.js';

log.setLevel(process.env.NODE_ENV === 'production' ? 'error' : 'trace');

const port: string | number = 5000;

await Container.get(Creds).build();
await Container.get(Vault).build();
const jamid = Container.get(Jamid);
const app = await Container.get(App).build();
const wss = await Container.get(Ws).build();

const server = createServer();

server.on('request', app);
server.on('upgrade', wss);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
process.once('SIGUSR2', shutdown);

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCESS':
      log.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address?.port}`;
  log.debug('Listening on ' + bind);
}

function shutdown(signal: NodeJS.Signals) {
  log.debug(`${signal} received: shutting down server`);
  jamid.stop();
  server.close(() => {
    log.debug('Server shut down');
    // Needed in order to actually exit the process as its shutdown is blocked by something else
    process.exit();
  });
}
