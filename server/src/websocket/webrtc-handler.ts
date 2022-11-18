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
import { WebSocketMessageTable, WebSocketMessageType } from 'jami-web-common';
import log from 'loglevel';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { WebSocketServer } from './websocket-server.js';

const jamid = Container.get(Jamid);
const webSocketServer = Container.get(WebSocketServer);

const webRTCWebSocketMessageTypes = [
  WebSocketMessageType.IceCandidate,
  WebSocketMessageType.WebRTCOffer,
  WebSocketMessageType.WebRTCAnswer,
  WebSocketMessageType.CallBegin,
  WebSocketMessageType.CallAccept,
  WebSocketMessageType.CallRefuse,
  WebSocketMessageType.CallEnd,
] as const;

type WebRTCWebSocketMessageType = typeof webRTCWebSocketMessageTypes[number];

function sendWebRTCData<T extends WebRTCWebSocketMessageType>(
  type: WebRTCWebSocketMessageType,
  data: Partial<WebSocketMessageTable[T]>
) {
  if (data.from === undefined || data.to === undefined) {
    log.warn('Message is not a valid AccountTextMessage (missing from or to fields)');
    return;
  }
  log.info('Handling WebRTC message of type:', type);
  jamid.sendAccountTextMessage(
    data.from,
    data.to,
    JSON.stringify({
      type,
      data,
    })
  );
}

export function bindWebRTCCallbacks() {
  for (const messageType of webRTCWebSocketMessageTypes) {
    webSocketServer.bind(messageType, (data) => {
      sendWebRTCData(messageType, data);
    });
  }
}
