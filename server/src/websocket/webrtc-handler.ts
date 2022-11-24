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
import { ContactMessage, WebSocketMessageType } from 'jami-web-common';
import log from 'loglevel';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { WebSocketServer } from './websocket-server.js';

const webRtcWebSocketMessageTypes = [
  WebSocketMessageType.CallBegin,
  WebSocketMessageType.CallAccept,
  WebSocketMessageType.CallRefuse,
  WebSocketMessageType.CallEnd,
  WebSocketMessageType.WebRtcOffer,
  WebSocketMessageType.WebRtcAnswer,
  WebSocketMessageType.WebRtcIceCandidate,
] as const;

const jamid = Container.get(Jamid);
const webSocketServer = Container.get(WebSocketServer);

export function bindWebRtcCallbacks() {
  for (const messageType of webRtcWebSocketMessageTypes) {
    webSocketServer.bind(messageType, (accountId, data) => {
      sendWebRtcData(messageType, accountId, data);
    });
  }
}

function sendWebRtcData(type: WebSocketMessageType, accountId: string, data: Partial<ContactMessage>) {
  if (data.contactId === undefined) {
    log.warn('Message is not a valid ContactMessage (missing contactId field)');
    return;
  }

  jamid.sendAccountTextMessage(accountId, data.contactId, JSON.stringify({ type, data }));
}
