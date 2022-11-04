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
import { AccountTextMessage, WebSocketMessage, WebSocketMessageType } from 'jami-web-common';
import log from 'loglevel';
import { Container } from 'typedi';

import { Jamid } from '../jamid/jamid.js';
import { Ws } from '../ws.js';

const jamid = Container.get(Jamid);
const ws = Container.get(Ws);

function sendWebRTCData(message: Partial<WebSocketMessage>) {
  const data: AccountTextMessage = message.data;
  if (!data.from || !data.to || !data.message) {
    log.warn('Incorrect format for AccountTextMessage (require from, to and message):', data);
    return;
  }
  jamid.sendAccountTextMessage(data.from, data.to, JSON.stringify(message));
}

export function bindWebRTCCallbacks() {
  ws.bind(WebSocketMessageType.WebRTCOffer, sendWebRTCData);
  ws.bind(WebSocketMessageType.WebRTCAnswer, sendWebRTCData);
}
