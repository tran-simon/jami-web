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
import { CallAction, CallBegin, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import LoadingPage from '../components/Loading';
import { useUrlParams } from '../hooks/useUrlParams';
import CallPermissionDenied from '../pages/CallPermissionDenied';
import { CallRouteParams } from '../router';
import { callTimeoutMs } from '../utils/constants';
import { SetState, WithChildren } from '../utils/utils';
import { ConversationContext } from './ConversationProvider';
import { WebRtcContext } from './WebRtcProvider';
import { IWebSocketContext, WebSocketContext } from './WebSocketProvider';

export type CallRole = 'caller' | 'receiver';

export enum CallStatus {
  Default,
  Loading,
  Ringing,
  Connecting,
  InCall,
  PermissionsDenied,
}

export interface ICallContext {
  isAudioOn: boolean;
  setIsAudioOn: SetState<boolean>;
  isVideoOn: boolean;
  setIsVideoOn: SetState<boolean>;
  isChatShown: boolean;
  setIsChatShown: SetState<boolean>;
  isFullscreen: boolean;
  setIsFullscreen: SetState<boolean>;
  callRole: CallRole;
  callStatus: CallStatus;
  callStartTime: Date | undefined;
  isAnswerButtonDisabled: boolean;

  acceptCall: (withVideoOn: boolean) => void;
  endCall: () => void;
}

const defaultCallContext: ICallContext = {
  isAudioOn: false,
  setIsAudioOn: () => {},
  isVideoOn: false,
  setIsVideoOn: () => {},
  isChatShown: false,
  setIsChatShown: () => {},
  isFullscreen: false,
  setIsFullscreen: () => {},
  callRole: 'caller',
  callStatus: CallStatus.Default,
  callStartTime: undefined,
  isAnswerButtonDisabled: false,

  acceptCall: (_: boolean) => {},
  endCall: () => {},
};

export const CallContext = createContext<ICallContext>(defaultCallContext);

export default ({ children }: WithChildren) => {
  const webSocket = useContext(WebSocketContext);

  if (!webSocket) {
    return <LoadingPage />;
  }

  return <CallProvider webSocket={webSocket}>{children}</CallProvider>;
};

const CallProvider = ({
  children,
  webSocket,
}: WithChildren & {
  webSocket: IWebSocketContext;
}) => {
  const { state: routeState } = useUrlParams<CallRouteParams>();
  const { localStream, sendWebRtcOffer, iceConnectionState, closeConnection, getUserMedia } = useContext(WebRtcContext);
  const { conversationId, conversation } = useContext(ConversationContext);
  const navigate = useNavigate();

  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isChatShown, setIsChatShown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState(routeState?.callStatus);
  const [callRole] = useState(routeState?.role);
  const [callStartTime, setCallStartTime] = useState<Date | undefined>(undefined);
  const [isAnswerButtonDisabled, setIsAnswerButtonDisabled] = useState(false);

  // TODO: This logic will have to change to support multiple people in a call. Could we move this logic to the server?
  //       The client could make a single request with the conversationId, and the server would be tasked with sending
  //       all the individual requests to the members of the conversation.
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
    if (localStream) {
      for (const track of localStream.getAudioTracks()) {
        track.enabled = isAudioOn;
      }
    }
  }, [isAudioOn, localStream]);

  useEffect(() => {
    if (localStream) {
      for (const track of localStream.getVideoTracks()) {
        track.enabled = isVideoOn;
      }
    }
  }, [isVideoOn, localStream]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (callRole === 'caller' && callStatus === CallStatus.Default) {
      setCallStatus(CallStatus.Loading);
      getUserMedia()
        .then(() => {
          const callBegin: CallBegin = {
            contactId: contactUri,
            conversationId,
            withVideoOn: routeState?.isVideoOn ?? false,
          };

          setCallStatus(CallStatus.Ringing);
          setIsVideoOn(routeState?.isVideoOn ?? false);
          console.info('Sending CallBegin', callBegin);
          webSocket.send(WebSocketMessageType.CallBegin, callBegin);
        })
        .catch((e) => {
          console.error(e);
          setCallStatus(CallStatus.PermissionsDenied);
        });
    }
  }, [webSocket, getUserMedia, callRole, callStatus, contactUri, conversationId, routeState]);

  const acceptCall = useCallback(
    (withVideoOn: boolean) => {
      setCallStatus(CallStatus.Loading);
      setIsAnswerButtonDisabled(true);
      getUserMedia()
        .then(() => {
          const callAccept: CallAction = {
            contactId: contactUri,
            conversationId,
          };

          setIsVideoOn(withVideoOn);
          setCallStatus(CallStatus.Connecting);
          console.info('Sending CallAccept', callAccept);
          webSocket.send(WebSocketMessageType.CallAccept, callAccept);
        })
        .catch((e) => {
          console.error(e);
          setCallStatus(CallStatus.PermissionsDenied);
        });
    },
    [webSocket, getUserMedia, contactUri, conversationId]
  );

  useEffect(() => {
    if (callRole === 'caller' && callStatus === CallStatus.Ringing) {
      const callAcceptListener = (data: CallAction) => {
        console.info('Received event on CallAccept', data);
        if (data.conversationId !== conversationId) {
          console.warn('Wrong incoming conversationId, ignoring action');
          return;
        }

        setCallStatus(CallStatus.Connecting);

        sendWebRtcOffer();
      };

      webSocket.bind(WebSocketMessageType.CallAccept, callAcceptListener);

      return () => {
        webSocket.unbind(WebSocketMessageType.CallAccept, callAcceptListener);
      };
    }
  }, [callRole, webSocket, sendWebRtcOffer, callStatus, conversationId]);

  const endCall = useCallback(() => {
    const callEnd: CallAction = {
      contactId: contactUri,
      conversationId,
    };

    console.info('Sending CallEnd', callEnd);
    closeConnection();
    webSocket.send(WebSocketMessageType.CallEnd, callEnd);
    navigate(`/conversation/${conversationId}`);
    // TODO: write in chat that the call ended
  }, [webSocket, contactUri, conversationId, closeConnection, navigate]);

  useEffect(() => {
    const callEndListener = (data: CallAction) => {
      console.info('Received event on CallEnd', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      closeConnection();
      navigate(`/conversation/${conversationId}`);
      // TODO: write in chat that the call ended
    };

    webSocket.bind(WebSocketMessageType.CallEnd, callEndListener);
    return () => {
      webSocket.unbind(WebSocketMessageType.CallEnd, callEndListener);
    };
  }, [webSocket, navigate, conversationId, closeConnection]);

  useEffect(() => {
    if (
      callStatus === CallStatus.Connecting &&
      (iceConnectionState === 'connected' || iceConnectionState === 'completed')
    ) {
      console.info('Changing call status to InCall');
      setCallStatus(CallStatus.InCall);
      setCallStartTime(new Date());
    }
  }, [iceConnectionState, callStatus]);

  useEffect(() => {
    if (iceConnectionState === 'disconnected' || iceConnectionState === 'failed') {
      console.info('ICE connection disconnected or failed, ending call');
      endCall();
    }
  }, [iceConnectionState, callStatus, isVideoOn, endCall]);

  useEffect(() => {
    const checkStatusTimeout = () => {
      if (callStatus !== CallStatus.InCall) {
        endCall();
      }
    };
    const timeoutId = setTimeout(checkStatusTimeout, callTimeoutMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [callStatus, endCall]);

  useEffect(() => {
    navigate('.', {
      replace: true,
      state: {},
    });
  }, [navigate]);

  if (!callRole || callStatus === undefined) {
    console.error('Invalid route. Redirecting...');
    return <Navigate to={'/'} />;
  }

  return (
    <CallContext.Provider
      value={{
        isAudioOn,
        setIsAudioOn,
        isVideoOn,
        setIsVideoOn,
        isChatShown,
        setIsChatShown,
        isFullscreen,
        setIsFullscreen,
        callRole,
        callStatus,
        callStartTime,
        isAnswerButtonDisabled,
        acceptCall,
        endCall,
      }}
    >
      {callStatus === CallStatus.PermissionsDenied ? <CallPermissionDenied /> : children}
    </CallContext.Provider>
  );
};
