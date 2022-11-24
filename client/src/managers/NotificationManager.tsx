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
import { CallAction, WebSocketMessageType } from 'jami-web-common';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthProvider';
import { WebSocketContext } from '../contexts/WebSocketProvider';
import { WithChildren } from '../utils/utils';

/**
 * Binds notification listeners to the WebSocket from a WebSocketContext
 */
export default ({ children }: WithChildren) => {
  const webSocket = useContext(WebSocketContext);
  const navigate = useNavigate();
  const { axiosInstance } = useAuthContext();

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const callBeginListener = (data: CallAction) => {
      console.info('Received event on CallBegin', data);
      navigate(`/conversation/${data.conversationId}/call?role=receiver`);
    };

    webSocket.bind(WebSocketMessageType.CallBegin, callBeginListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.CallBegin, callBeginListener);
    };
  }, [webSocket, navigate, axiosInstance]);

  return <>{children}</>;
};
