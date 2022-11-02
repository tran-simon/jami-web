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
import { WebSocketMessage, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { apiUrl } from '../utils/constants';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';

export type WebSocketMessageFn = (message: WebSocketMessage) => void;

interface IWebSocketContext {
  bind: (type: WebSocketMessageType, callback: WebSocketMessageFn) => void;
  send: WebSocketMessageFn;
}

export const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

export default ({ children }: WithChildren) => {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket>();
  const callbacksRef = useRef(new Map<WebSocketMessageType, WebSocketMessageFn[]>());

  const { token: accessToken } = useAuthContext();

  const bind = useCallback((type: WebSocketMessageType, messageCallback: WebSocketMessageFn) => {
    const messageCallbacks = callbacksRef.current.get(type);
    if (messageCallbacks) {
      messageCallbacks.push(messageCallback);
    } else {
      callbacksRef.current.set(type, [messageCallback]);
    }
  }, []);

  const send = useCallback(
    (message: WebSocketMessage) => {
      if (isConnected) {
        webSocketRef.current?.send(JSON.stringify(message));
      }
    },
    [isConnected]
  );

  const handleOnOpen = useCallback(() => setIsConnected(true), []);

  const handleOnClose = useCallback(() => {
    setIsConnected(false);
    callbacksRef.current.clear();
  }, []);

  const handleOnMessage = useCallback(({ data }: MessageEvent<string>) => {
    const message: WebSocketMessage = JSON.parse(data);
    const messageCallbacks = callbacksRef.current.get(message.type);
    if (messageCallbacks) {
      for (const messageCallback of messageCallbacks) {
        messageCallback(message);
      }
    } else {
      console.warn(`Unhandled message of type ${message.type}`);
    }
  }, []);

  const handleOnError = useCallback((event: Event) => {
    console.error('Closing WebSocket due to an error:', event);
    webSocketRef.current?.close();
  }, []);

  useEffect(() => {
    const url = new URL(apiUrl);
    url.protocol = 'ws:';
    url.searchParams.set('accessToken', accessToken);

    const webSocket = new WebSocket(url);
    webSocket.onopen = handleOnOpen;
    webSocket.onclose = handleOnClose;
    webSocket.onmessage = handleOnMessage;
    webSocket.onerror = handleOnError;

    webSocketRef.current = webSocket;

    return () => webSocket.close();
  }, [accessToken, handleOnOpen, handleOnClose, handleOnMessage, handleOnError]);

  return isConnected ? (
    <WebSocketContext.Provider value={{ bind, send }}>{children}</WebSocketContext.Provider>
  ) : (
    <>{children}</>
  );
};
