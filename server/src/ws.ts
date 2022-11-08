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
import { IncomingMessage } from 'node:http';
import { Duplex } from 'node:stream';

import { WebSocketMessage, WebSocketMessageType } from 'jami-web-common';
import { jwtVerify } from 'jose';
import log from 'loglevel';
import { Service } from 'typedi';
import { URL } from 'whatwg-url';
import { WebSocket, WebSocketServer } from 'ws';

import { Vault } from './vault.js';

@Service()
export class Ws {
  private sockets: Map<string, WebSocket[]>;
  private callbacks: Map<WebSocketMessageType, ((message: WebSocketMessage) => void)[]>;

  constructor(private readonly vault: Vault) {
    this.sockets = new Map();
    this.callbacks = new Map();
  }

  async build() {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws: WebSocket, _req: IncomingMessage, accountId: string) => {
      log.info('New connection', accountId);
      const accountSockets = this.sockets.get(accountId);
      if (accountSockets) {
        accountSockets.push(ws);
      } else {
        this.sockets.set(accountId, [ws]);
      }

      ws.on('message', (messageString: string) => {
        const message: WebSocketMessage = JSON.parse(messageString);
        if (!message.type || !message.data) {
          ws.send('Incorrect format (require type and data)');
          return;
        }
        const callbacks = this.callbacks.get(message.type);
        if (callbacks) {
          for (const callback of callbacks) {
            callback(message);
          }
        }
      });

      ws.on('close', () => {
        log.info('Connection close', accountId);
        const accountSockets = this.sockets.get(accountId);
        const index = accountSockets?.indexOf(ws);
        if (index !== undefined) {
          accountSockets?.splice(index, 1);
          if (accountSockets?.length === 0) {
            this.sockets.delete(accountId);
          }
        }
      });
    });

    return (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      // Do not use parseURL because it returns a URLRecord and not a URL.
      const url = new URL(request.url ?? '/', 'http://localhost/');
      const accessToken = url.searchParams.get('accessToken');
      if (!accessToken) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      jwtVerify(accessToken, this.vault.publicKey, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience',
      })
        .then(({ payload }) => {
          const id = payload.id as string;
          log.info('Authentication successful', id);
          wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request, id));
        })
        .catch((reason) => {
          log.debug('Authentication failed', reason);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
        });
    };
  }

  bind(messageType: WebSocketMessageType, callback: (message: WebSocketMessage) => void): void {
    const messageTypeCallbacks = this.callbacks.get(messageType);
    if (messageTypeCallbacks) {
      messageTypeCallbacks.push(callback);
    } else {
      this.callbacks.set(messageType, [callback]);
    }
  }

  send(accountId: string, message: WebSocketMessage): boolean {
    const accountSockets = this.sockets.get(accountId);
    if (!accountSockets) {
      return false;
    }
    for (const accountSocket of accountSockets) {
      accountSocket.send(message);
    }
    return true;
  }
}
