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

import {
  buildWebSocketCallbacks,
  WebSocketCallback,
  WebSocketCallbacks,
  WebSocketMessage,
  WebSocketMessageTable,
  WebSocketMessageType,
} from 'jami-web-common';
import log from 'loglevel';
import { Service } from 'typedi';
import { URL } from 'whatwg-url';
import * as WebSocket from 'ws';

import { verifyJwt } from '../utils/jwt.js';

@Service()
export class WebSocketServer {
  private wss = new WebSocket.WebSocketServer({ noServer: true });
  private sockets = new Map<string, WebSocket.WebSocket[]>();
  private callbacks: WebSocketCallbacks = buildWebSocketCallbacks();

  constructor() {
    this.wss.on('connection', (ws: WebSocket.WebSocket, _request: IncomingMessage, accountId: string) => {
      log.info('New connection for account', accountId);
      const accountSockets = this.sockets.get(accountId);
      if (accountSockets) {
        accountSockets.push(ws);
      } else {
        this.sockets.set(accountId, [ws]);
      }

      ws.on('message', <T extends WebSocketMessageType>(messageString: string) => {
        const message: WebSocketMessage<T> = JSON.parse(messageString);
        if (message.type === undefined || message.data === undefined) {
          log.warn('WebSocket message is not a valid WebSocketMessage (missing type or data fields)');
          return;
        }

        if (!Object.values(WebSocketMessageType).includes(message.type)) {
          log.warn(`Invalid WebSocket message type: ${message.type}`);
          return;
        }

        const callbacks = this.callbacks[message.type];
        for (const callback of callbacks) {
          callback(message.data);
        }
      });

      ws.on('close', () => {
        log.info('Closing connection for account', accountId);
        const accountSockets = this.sockets.get(accountId);
        if (accountSockets === undefined) {
          return;
        }

        const index = accountSockets.indexOf(ws);
        if (index !== -1) {
          accountSockets.splice(index, 1);
          if (accountSockets.length === 0) {
            this.sockets.delete(accountId);
          }
        }
      });
    });
  }

  async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    // Do not use parseURL because it returns a URLRecord and not a URL
    const url = new URL(request.url ?? '/', 'http://localhost/');
    const token = url.searchParams.get('accessToken') ?? undefined;
    if (token === undefined) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const { payload } = await verifyJwt(token);
      const accountId = payload.accountId as string;
      log.info('Authentication successful for account', accountId);
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request, accountId);
      });
    } catch (e) {
      log.debug('Authentication failed:', e);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  }

  bind<T extends WebSocketMessageType>(type: T, callback: WebSocketCallback<T>): void {
    this.callbacks[type].add(callback);
  }

  send<T extends WebSocketMessageType>(accountId: string, type: T, data: WebSocketMessageTable[T]): boolean {
    const accountSockets = this.sockets.get(accountId);
    if (accountSockets === undefined) {
      return false;
    }

    const webSocketMessageString = JSON.stringify({ type, data });
    for (const accountSocket of accountSockets) {
      accountSocket.send(webSocketMessageString);
    }
    return true;
  }
}
