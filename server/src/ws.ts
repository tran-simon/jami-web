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

import { Service } from 'typedi';
import { WebSocket, WebSocketServer } from 'ws';

@Service()
class Ws {
  async build() {
    await Promise.resolve(42);

    const wss = new WebSocketServer({
      noServer: true,
    });
    wss.on('connection', (ws: WebSocket, _req: IncomingMessage, id: string) => {
      ws.on('message', (data) => {
        ws.send(
          JSON.stringify({
            id,
            data,
          })
        );
      });
    });

    return (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request, '42'));
    };
  }
}

export { Ws };
