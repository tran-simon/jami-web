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
import { WebSocketMessageType } from '../enums/websocket-message-type.js';
import { AccountTextMessage } from './account-text-message.js';
import { ConversationMessage } from './conversation-message.js';
import { ConversationView } from './conversation-view.js';
import { WebRTCIceCandidate } from './webrtc-ice-candidate.js';
import { WebRTCSDP } from './webrtc-sdp.js';

export interface WebSocketMessageTable {
  [WebSocketMessageType.ConversationMessage]: ConversationMessage;
  [WebSocketMessageType.ConversationView]: ConversationView;
  [WebSocketMessageType.WebRTCOffer]: AccountTextMessage<WebRTCSDP>;
  [WebSocketMessageType.WebRTCAnswer]: AccountTextMessage<WebRTCSDP>;
  [WebSocketMessageType.IceCandidate]: AccountTextMessage<WebRTCIceCandidate>;
}

export interface WebSocketMessage<T extends WebSocketMessageType> {
  type: T;
  data: WebSocketMessageTable[T];
}
