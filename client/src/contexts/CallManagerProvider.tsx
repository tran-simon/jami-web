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
import { CallBegin, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RemoteVideoOverlay } from '../components/VideoOverlay';
import { useUrlParams } from '../hooks/useUrlParams';
import { Conversation } from '../models/conversation';
import { ConversationRouteParams } from '../router';
import { useConversationQuery } from '../services/conversationQueries';
import { SetState, WithChildren } from '../utils/utils';
import CallProvider, { CallRole } from './CallProvider';
import WebRtcProvider from './WebRtcProvider';
import { WebSocketContext } from './WebSocketProvider';

type CallData = {
  conversationId: string;
  role: CallRole;
  withVideoOn?: boolean;
};

type ICallManagerContext = {
  callData: CallData | undefined;
  callConversation: Conversation | undefined;

  startCall: SetState<CallData | undefined>;
  exitCall: () => void;
};

export const CallManagerContext = createContext<ICallManagerContext>(undefined!);
CallManagerContext.displayName = 'CallManagerContext';

export default ({ children }: WithChildren) => {
  const [callData, setCallData] = useState<CallData>();
  const webSocket = useContext(WebSocketContext);
  const navigate = useNavigate();
  const conversationId = callData?.conversationId;
  const { conversation } = useConversationQuery(conversationId);

  const failStartCall = useCallback(() => {
    throw new Error('Cannot start call: Already in a call');
  }, []);

  const startCall = !callData ? setCallData : failStartCall;

  const exitCall = useCallback(() => {
    if (!callData) {
      return;
    }

    setCallData(undefined);
    // TODO: write in chat that the call ended
  }, [callData]);

  useEffect(() => {
    if (callData) {
      // TODO: Currently, we simply do not bind the CallBegin listener if already in a call.
      //       In the future, we should handle receiving a call while already in another.
      return;
    }
    if (!webSocket) {
      return;
    }

    const callBeginListener = ({ conversationId, withVideoOn }: CallBegin) => {
      startCall({ conversationId: conversationId, role: 'receiver', withVideoOn });
      navigate(`/conversation/${conversationId}`);
    };

    webSocket.bind(WebSocketMessageType.CallBegin, callBeginListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.CallBegin, callBeginListener);
    };
  }, [webSocket, navigate, startCall, callData]);

  return (
    <CallManagerContext.Provider
      value={{
        startCall,
        callData,
        callConversation: conversation,
        exitCall,
      }}
    >
      <CallManagerProvider>{children}</CallManagerProvider>
    </CallManagerContext.Provider>
  );
};

const CallManagerProvider = ({ children }: WithChildren) => {
  const { callData } = useContext(CallManagerContext);
  const { urlParams } = useUrlParams<ConversationRouteParams>();
  const conversationId = urlParams.conversationId;

  if (!callData) {
    return <>{children}</>;
  }

  return (
    <WebRtcProvider>
      <CallProvider>
        {callData.conversationId !== conversationId && (
          <RemoteVideoOverlay callConversationId={callData.conversationId} />
        )}
        {children}
      </CallProvider>
    </WebRtcProvider>
  );
};
