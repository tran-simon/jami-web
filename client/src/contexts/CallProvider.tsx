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
import { CallRouteParams } from '../router';
import { callTimeoutMs } from '../utils/constants';
import { SetState, WithChildren } from '../utils/utils';
import { ConversationContext } from './ConversationProvider';
import { WebRtcContext } from './WebRtcProvider';
import { IWebSocketContext, WebSocketContext } from './WebSocketProvider';

export type CallRole = 'caller' | 'receiver';

export enum CallStatus {
  Default,
  Ringing,
  Connecting,
  InCall,
}

export interface ICallContext {
  mediaDevices: Record<MediaDeviceKind, MediaDeviceInfo[]>;

  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined; // TODO: should be an array of participants. find a way to map MediaStream id to contactid https://stackoverflow.com/a/68663155/6592293

  isAudioOn: boolean;
  setAudioStatus: (isOn: boolean) => void;
  isVideoOn: boolean;
  setVideoStatus: (isOn: boolean) => void;
  isChatShown: boolean;
  setIsChatShown: SetState<boolean>;
  isFullscreen: boolean;
  setIsFullscreen: SetState<boolean>;
  callRole: CallRole;
  callStatus: CallStatus;
  callStartTime: Date | undefined;

  acceptCall: (withVideoOn: boolean) => void;
  endCall: () => void;
}

const defaultCallContext: ICallContext = {
  mediaDevices: {
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  },

  localStream: undefined,
  remoteStream: undefined,

  isAudioOn: false,
  setAudioStatus: () => {},
  isVideoOn: false,
  setVideoStatus: () => {},
  isChatShown: false,
  setIsChatShown: () => {},
  isFullscreen: false,
  setIsFullscreen: () => {},
  callRole: 'caller',
  callStatus: CallStatus.Default,
  callStartTime: undefined,

  acceptCall: (_: boolean) => {},
  endCall: () => {},
};

export const CallContext = createContext<ICallContext>(defaultCallContext);

export default ({ children }: WithChildren) => {
  const webSocket = useContext(WebSocketContext);
  const { webRtcConnection } = useContext(WebRtcContext);

  if (!webSocket || !webRtcConnection) {
    return <LoadingPage />;
  }

  return (
    <CallProvider webSocket={webSocket} webRtcConnection={webRtcConnection}>
      {children}
    </CallProvider>
  );
};

const CallProvider = ({
  children,
  webSocket,
  webRtcConnection,
}: WithChildren & {
  webSocket: IWebSocketContext;
  webRtcConnection: RTCPeerConnection;
}) => {
  const { state: routeState } = useUrlParams<CallRouteParams>();
  const { remoteStreams, sendWebRtcOffer, iceConnectionState } = useContext(WebRtcContext);
  const { conversationId, conversation } = useContext(ConversationContext);
  const navigate = useNavigate();

  const [mediaDevices, setMediaDevices] = useState<Record<MediaDeviceKind, MediaDeviceInfo[]>>(
    defaultCallContext.mediaDevices
  );
  const [localStream, setLocalStream] = useState<MediaStream>();

  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isChatShown, setIsChatShown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState(routeState?.callStatus);
  const [callRole] = useState(routeState?.role);
  const [callStartTime, setCallStartTime] = useState<Date | undefined>(undefined);

  // TODO: This logic will have to change to support multiple people in a call. Could we move this logic to the server?
  //       The client could make a single request with the conversationId, and the server would be tasked with sending
  //       all the individual requests to the members of the conversation.
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
    try {
      // TODO: Wait until status is `InCall` before getting devices
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const newMediaDevices: Record<MediaDeviceKind, MediaDeviceInfo[]> = {
          audioinput: [],
          audiooutput: [],
          videoinput: [],
        };

        for (const device of devices) {
          newMediaDevices[device.kind].push(device);
        }

        setMediaDevices(newMediaDevices);
      });
    } catch (e) {
      console.error('Could not get media devices:', e);
    }

    try {
      navigator.mediaDevices
        .getUserMedia({
          audio: true, // TODO: Set both to false by default
          video: true,
        })
        .then((stream) => {
          for (const track of stream.getTracks()) {
            // TODO: Set default from isVideoOn and isMicOn values
            track.enabled = false;
          }
          setLocalStream(stream);
        });
    } catch (e) {
      // TODO: Better handle user denial
      console.error('Could not get media devices:', e);
    }
  }, []);

  useEffect(() => {
    if (localStream) {
      for (const track of localStream.getTracks()) {
        webRtcConnection.addTrack(track, localStream);
      }
    }
  }, [localStream, webRtcConnection]);

  const setAudioStatus = useCallback(
    (isOn: boolean) => {
      if (!localStream) {
        return;
      }

      for (const track of localStream.getAudioTracks()) {
        track.enabled = isOn;
      }

      setIsAudioOn(isOn);
    },
    [localStream]
  );

  const setVideoStatus = useCallback(
    (isOn: boolean) => {
      if (!localStream) {
        return;
      }

      for (const track of localStream.getVideoTracks()) {
        track.enabled = isOn;
      }

      setIsVideoOn(isOn);
    },
    [localStream]
  );

  useEffect(() => {
    if (callRole === 'caller' && callStatus === CallStatus.Default) {
      const callBegin: CallBegin = {
        contactId: contactUri,
        conversationId,
        withVideoOn: routeState?.isVideoOn ?? false,
      };

      console.info('Sending CallBegin', callBegin);
      webSocket.send(WebSocketMessageType.CallBegin, callBegin);
      setCallStatus(CallStatus.Ringing);
      setIsVideoOn(routeState?.isVideoOn ?? false);
    }
  }, [webSocket, callRole, callStatus, contactUri, conversationId, routeState]);

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
    if (callRole === 'caller' && callStatus === CallStatus.Ringing) {
      const callAcceptListener = (data: CallAction) => {
        console.info('Received event on CallAccept', data);
        if (data.conversationId !== conversationId) {
          console.warn('Wrong incoming conversationId, ignoring action');
          return;
        }

        setCallStatus(CallStatus.Connecting);

        webRtcConnection
          .createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then((sdp) => {
            sendWebRtcOffer(sdp);
          });
      };

      webSocket.bind(WebSocketMessageType.CallAccept, callAcceptListener);

      return () => {
        webSocket.unbind(WebSocketMessageType.CallAccept, callAcceptListener);
      };
    }
  }, [callRole, webSocket, webRtcConnection, sendWebRtcOffer, callStatus, conversationId]);

  const quitCall = useCallback(() => {
    const localTracks = localStream?.getTracks();
    if (localTracks) {
      for (const track of localTracks) {
        track.stop();
      }
    }

    webRtcConnection.close();
    navigate(`/conversation/${conversationId}`);
  }, [webRtcConnection, localStream, navigate, conversationId]);

  useEffect(() => {
    const callEndListener = (data: CallAction) => {
      console.info('Received event on CallEnd', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      quitCall();
      // TODO: write in chat that the call ended
    };

    webSocket.bind(WebSocketMessageType.CallEnd, callEndListener);
    return () => {
      webSocket.unbind(WebSocketMessageType.CallEnd, callEndListener);
    };
  }, [webSocket, navigate, conversationId, quitCall]);

  useEffect(() => {
    if (
      callStatus === CallStatus.Connecting &&
      (iceConnectionState === 'connected' || iceConnectionState === 'completed')
    ) {
      console.info('Changing call status to InCall');
      setCallStatus(CallStatus.InCall);
      setVideoStatus(isVideoOn);
      setCallStartTime(new Date());
    }
  }, [iceConnectionState, callStatus, setVideoStatus, isVideoOn]);

  const acceptCall = useCallback(
    (withVideoOn: boolean) => {
      const callAccept: CallAction = {
        contactId: contactUri,
        conversationId,
      };

      console.info('Sending CallAccept', callAccept);
      webSocket.send(WebSocketMessageType.CallAccept, callAccept);
      setIsVideoOn(withVideoOn);
      setCallStatus(CallStatus.Connecting);
    },
    [webSocket, contactUri, conversationId]
  );

  const endCall = useCallback(() => {
    const callEnd: CallAction = {
      contactId: contactUri,
      conversationId,
    };

    console.info('Sending CallEnd', callEnd);
    webSocket.send(WebSocketMessageType.CallEnd, callEnd);
    quitCall();
    // TODO: write in chat that the call ended
  }, [webSocket, contactUri, conversationId, quitCall]);

  useEffect(() => {
    if (iceConnectionState === 'disconnected') {
      console.info('ICE connection disconnected');
      endCall();
    }
  }, [iceConnectionState, callStatus, setVideoStatus, isVideoOn, endCall]);

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
        mediaDevices,
        localStream,
        remoteStream: remoteStreams?.at(-1),
        isAudioOn,
        setAudioStatus,
        isVideoOn,
        setVideoStatus,
        isChatShown,
        setIsChatShown,
        isFullscreen,
        setIsFullscreen,
        callRole,
        callStatus,
        callStartTime,
        acceptCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
