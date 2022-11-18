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
import {
  buildWebSocketCallbacks,
  WebSocketCallbacks,
  WebSocketMessage,
  WebSocketMessageTable,
  WebSocketMessageType,
} from 'jami-web-common';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { apiUrl } from '../utils/constants';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';

type BindFunction = <T extends WebSocketMessageType>(
  type: T,
  callback: (data: WebSocketMessageTable[T]) => void
) => void;
type SendFunction = <T extends WebSocketMessageType>(type: T, data: WebSocketMessageTable[T]) => void;

export interface IWebSocketContext {
  bind: BindFunction;
  unbind: BindFunction;
  send: SendFunction;
}

export const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

export default ({ children }: WithChildren) => {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket>();
  const callbacksRef = useRef<WebSocketCallbacks>(buildWebSocketCallbacks());

  const { token: accessToken } = useAuthContext();

  const bind: BindFunction = useCallback((type, callback) => {
    const callbacks = callbacksRef.current[type];
    callbacks.add(callback);
  }, []);

  const unbind: BindFunction = useCallback((type, callback) => {
    const callbacks = callbacksRef.current[type];
    callbacks.delete(callback);
  }, []);

  const send: SendFunction = useCallback(
    (type, data) => {
      if (isConnected) {
        webSocketRef.current?.send(JSON.stringify({ type, data }));
      }
    },
    [isConnected]
  );

  const connect = useCallback(() => {
    const url = new URL(apiUrl);
    url.protocol = 'ws:';
    url.searchParams.set('accessToken', accessToken);

    const webSocket = new WebSocket(url);

    webSocket.onopen = () => {
      console.debug('WebSocket connected');
      setIsConnected(true);
    };

    webSocket.onclose = () => {
      console.debug('WebSocket disconnected');
      setIsConnected(false);
      for (const callbacks of Object.values(callbacksRef.current)) {
        callbacks.clear();
      }
      setTimeout(connect, 1000);
    };

    webSocket.onmessage = <T extends WebSocketMessageType>(event: MessageEvent<string>) => {
      const messageString = event.data;
      console.debug('WebSocket received message', messageString);

      const message: WebSocketMessage<T> = JSON.parse(messageString);
      if (!message.type || !message.data) {
        console.warn('WebSocket message is not a valid WebSocketMessage (missing type or data fields)');
        return;
      }

      if (!Object.values(WebSocketMessageType).includes(message.type)) {
        console.warn(`Invalid WebSocket message type: ${message.type}`);
        return;
      }

      const callbacks = callbacksRef.current[message.type];
      for (const callback of callbacks) {
        callback(message.data);
      }
    };

    webSocket.onerror = (event: Event) => {
      console.error('Closing WebSocket due to an error:', event);
      webSocketRef.current?.close();
    };

    webSocketRef.current = webSocket;

    return () => {
      switch (webSocket.readyState) {
        case webSocket.CONNECTING:
          webSocket.onopen = () => webSocket.close();
          break;
        case webSocket.OPEN:
          webSocket.close();
          break;
      }
    };
  }, [accessToken]);

  useEffect(connect, [connect]);

  return (
    <WebSocketContext.Provider
      value={
        isConnected
          ? {
              bind,
              unbind,
              send,
            }
          : undefined
      }
    >
      {children}
    </WebSocketContext.Provider>
  );
};
