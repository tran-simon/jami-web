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
import { WebSocketMessageTable } from '../interfaces/websocket-message.js';

export type WebSocketCallback<T extends WebSocketMessageType> = (data: WebSocketMessageTable[T]) => void;
export type WebSocketCallbacks = {
  [key in WebSocketMessageType]: Set<WebSocketCallback<key>>;
};

export const buildWebSocketCallbacks = (): WebSocketCallbacks => {
  const webSocketCallback = {} as WebSocketCallbacks;
  for (const type of Object.values(WebSocketMessageType)) {
    webSocketCallback[type] = new Set<WebSocketCallback<typeof type>>();
  }

  return webSocketCallback;
};
