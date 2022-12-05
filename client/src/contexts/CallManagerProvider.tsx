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
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AlertSnackbar } from '../components/AlertSnackbar';
import { RemoteVideoOverlay } from '../components/VideoOverlay';
import { useUrlParams } from '../hooks/useUrlParams';
import { Conversation } from '../models/conversation';
import { ConversationRouteParams } from '../router';
import { useConversationQuery } from '../services/conversationQueries';
import { SetState, WithChildren } from '../utils/utils';
import CallProvider, { CallRole } from './CallProvider';
import WebRtcProvider from './WebRtcProvider';
import { WebSocketContext } from './WebSocketProvider';

export type CallData = {
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

const defaultCallManagerContext: ICallManagerContext = {
  callData: undefined,
  callConversation: undefined,

  startCall: () => {},
  exitCall: () => {},
};

export const CallManagerContext = createContext<ICallManagerContext>(defaultCallManagerContext);
CallManagerContext.displayName = 'CallManagerContext';

export default ({ children }: WithChildren) => {
  const [callData, setCallData] = useState<CallData>();
  const webSocket = useContext(WebSocketContext);
  const navigate = useNavigate();
  const { conversation } = useConversationQuery(callData?.conversationId);
  const { urlParams } = useUrlParams<ConversationRouteParams>();
  const [missedCallConversationId, setMissedCallConversationId] = useState<string>();
  const { t } = useTranslation();

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
    if (!webSocket) {
      return;
    }

    const callBeginListener = ({ conversationId, withVideoOn }: CallBegin) => {
      if (callData) {
        // TODO: Currently, we display a notification if already in a call.
        //       In the future, we should handle receiving a call while already in another.
        setMissedCallConversationId(conversationId);
        return;
      }

      startCall({ conversationId: conversationId, role: 'receiver', withVideoOn });
      navigate(`/conversation/${conversationId}`);
    };

    webSocket.bind(WebSocketMessageType.CallBegin, callBeginListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.CallBegin, callBeginListener);
    };
  }, [webSocket, navigate, startCall, callData]);

  const value = useMemo(
    () => ({
      startCall,
      callData,
      callConversation: conversation,
      exitCall,
    }),
    [startCall, callData, conversation, exitCall]
  );

  return (
    <>
      <AlertSnackbar
        severity={'info'}
        open={missedCallConversationId !== undefined}
        onClose={() => setMissedCallConversationId(undefined)}
      >
        {t('missed_incoming_call', { conversationId: missedCallConversationId })}
      </AlertSnackbar>
      <CallManagerContext.Provider value={value}>
        <WebRtcProvider>
          <CallProvider>
            {callData && callData.conversationId !== urlParams.conversationId && (
              <RemoteVideoOverlay callConversationId={callData.conversationId} />
            )}
            {children}
          </CallProvider>
        </WebRtcProvider>
      </CallManagerContext.Provider>
    </>
  );
};
