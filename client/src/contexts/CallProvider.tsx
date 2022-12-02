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
import { Navigate } from 'react-router-dom';

import LoadingPage from '../components/Loading';
import { Conversation } from '../models/Conversation';
import { callTimeoutMs } from '../utils/constants';
import { AsyncSetState, SetState, WithChildren } from '../utils/utils';
import { CallManagerContext } from './CallManagerProvider';
import { MediaDevicesInfo, MediaInputKind, WebRtcContext } from './WebRtcProvider';
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

export enum VideoStatus {
  Off,
  Camera,
  ScreenShare,
}

type MediaDeviceIdState = {
  id: string | undefined;
  setId: (id: string | undefined) => void | Promise<void>;
};
type CurrentMediaDeviceIds = Record<MediaDeviceKind, MediaDeviceIdState>;

export interface ICallContext {
  mediaDevices: MediaDevicesInfo;
  currentMediaDeviceIds: CurrentMediaDeviceIds;

  isAudioOn: boolean;
  setIsAudioOn: SetState<boolean>;
  videoStatus: VideoStatus;
  updateVideoStatus: AsyncSetState<VideoStatus>;
  isChatShown: boolean;
  setIsChatShown: SetState<boolean>;
  isFullscreen: boolean;
  setIsFullscreen: SetState<boolean>;
  callRole: CallRole;
  callStatus: CallStatus;
  callStartTime: number | undefined;

  acceptCall: (withVideoOn: boolean) => void;
  endCall: () => void;
}

const defaultCallContext: ICallContext = {
  mediaDevices: {
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  },
  currentMediaDeviceIds: {
    audioinput: {
      id: undefined,
      setId: async () => {},
    },
    audiooutput: {
      id: undefined,
      setId: async () => {},
    },
    videoinput: {
      id: undefined,
      setId: async () => {},
    },
  },

  isAudioOn: false,
  setIsAudioOn: () => {},
  videoStatus: VideoStatus.Off,
  updateVideoStatus: () => Promise.reject(),
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
  const { callConversation, callData } = useContext(CallManagerContext);

  if (!webSocket || !callConversation || !callData?.conversationId) {
    return <LoadingPage />;
  }

  return (
    <CallProvider webSocket={webSocket} conversation={callConversation} conversationId={callData?.conversationId}>
      {children}
    </CallProvider>
  );
};

const CallProvider = ({
  children,
  conversation,
  conversationId,
  webSocket,
}: WithChildren & {
  webSocket: IWebSocketContext;
  conversation: Conversation;
  conversationId: string;
}) => {
  const { callData, exitCall } = useContext(CallManagerContext);
  const {
    localStream,
    updateScreenShare,
    sendWebRtcOffer,
    iceConnectionState,
    closeConnection,
    getMediaDevices,
    updateLocalStream,
  } = useContext(WebRtcContext);

  const [mediaDevices, setMediaDevices] = useState(defaultCallContext.mediaDevices);
  const [audioInputDeviceId, setAudioInputDeviceId] = useState<string>();
  const [audioOutputDeviceId, setAudioOutputDeviceId] = useState<string>();
  const [videoDeviceId, setVideoDeviceId] = useState<string>();

  const [isAudioOn, setIsAudioOn] = useState(false);
  const [videoStatus, setVideoStatus] = useState(VideoStatus.Off);
  const [isChatShown, setIsChatShown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.Default);
  const [callRole] = useState(callData?.role);
  const [callStartTime, setCallStartTime] = useState<number | undefined>(undefined);

  // TODO: This logic will have to change to support multiple people in a call. Could we move this logic to the server?
  //       The client could make a single request with the conversationId, and the server would be tasked with sending
  //       all the individual requests to the members of the conversation.
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
    if (callStatus !== CallStatus.InCall) {
      return;
    }

    const updateMediaDevices = async () => {
      try {
        const newMediaDevices = await getMediaDevices();

        if (newMediaDevices.audiooutput.length !== 0 && !audioOutputDeviceId) {
          setAudioOutputDeviceId(newMediaDevices.audiooutput[0].deviceId);
        }

        setMediaDevices(newMediaDevices);
      } catch (e) {
        console.error('Could not update media devices:', e);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', updateMediaDevices);
    updateMediaDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateMediaDevices);
    };
  }, [callStatus, getMediaDevices, audioOutputDeviceId]);

  useEffect(() => {
    if (localStream) {
      for (const track of localStream.getAudioTracks()) {
        track.enabled = isAudioOn;
        const deviceId = track.getSettings().deviceId;
        if (deviceId) {
          setAudioInputDeviceId(deviceId);
        }
      }
    }
  }, [isAudioOn, localStream]);

  useEffect(() => {
    if (localStream) {
      for (const track of localStream.getVideoTracks()) {
        track.enabled = videoStatus === VideoStatus.Camera;
        const deviceId = track.getSettings().deviceId;
        if (deviceId) {
          setVideoDeviceId(deviceId);
        }
      }
    }
  }, [videoStatus, localStream]);

  const updateVideoStatus = useCallback(
    async (newStatus: ((prevState: VideoStatus) => VideoStatus) | VideoStatus) => {
      if (typeof newStatus === 'function') {
        newStatus = newStatus(videoStatus);
      }

      const stream = await updateScreenShare(newStatus === VideoStatus.ScreenShare);
      if (stream) {
        for (const track of stream.getTracks()) {
          track.addEventListener('ended', () => {
            console.warn('Browser ended screen sharing');
            updateVideoStatus(VideoStatus.Off);
          });
        }
      }

      setVideoStatus(newStatus);
    },
    [videoStatus, updateScreenShare]
  );

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
      const withVideoOn = callData?.withVideoOn ?? false;
      setCallStatus(CallStatus.Loading);
      updateLocalStream()
        .then(() => {
          const callBegin: CallBegin = {
            contactId: contactUri,
            conversationId,
            withVideoOn,
          };

          setCallStatus(CallStatus.Ringing);
          setVideoStatus(withVideoOn ? VideoStatus.Camera : VideoStatus.Off);
          console.info('Sending CallBegin', callBegin);
          webSocket.send(WebSocketMessageType.CallBegin, callBegin);
        })
        .catch((e) => {
          console.error(e);
          setCallStatus(CallStatus.PermissionsDenied);
        });
    }
  }, [webSocket, updateLocalStream, callRole, callStatus, contactUri, conversationId, callData]);

  const acceptCall = useCallback(
    (withVideoOn: boolean) => {
      setCallStatus(CallStatus.Loading);
      updateLocalStream()
        .then(() => {
          const callAccept: CallAction = {
            contactId: contactUri,
            conversationId,
          };

          setVideoStatus(withVideoOn ? VideoStatus.Camera : VideoStatus.Off);
          setCallStatus(CallStatus.Connecting);
          console.info('Sending CallAccept', callAccept);
          webSocket.send(WebSocketMessageType.CallAccept, callAccept);
        })
        .catch((e) => {
          console.error(e);
          setCallStatus(CallStatus.PermissionsDenied);
        });
    },
    [webSocket, updateLocalStream, contactUri, conversationId]
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
    exitCall();
    // TODO: write in chat that the call ended
  }, [webSocket, contactUri, conversationId, closeConnection, exitCall]);

  useEffect(() => {
    const callEndListener = (data: CallAction) => {
      console.info('Received event on CallEnd', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      closeConnection();
      exitCall();
      // TODO: write in chat that the call ended
    };

    webSocket.bind(WebSocketMessageType.CallEnd, callEndListener);
    return () => {
      webSocket.unbind(WebSocketMessageType.CallEnd, callEndListener);
    };
  }, [webSocket, exitCall, conversationId, closeConnection]);

  useEffect(() => {
    if (
      callStatus === CallStatus.Connecting &&
      (iceConnectionState === 'connected' || iceConnectionState === 'completed')
    ) {
      console.info('Changing call status to InCall');
      setCallStatus(CallStatus.InCall);
      setCallStartTime(Date.now());
    }
  }, [iceConnectionState, callStatus]);

  useEffect(() => {
    if (iceConnectionState === 'disconnected' || iceConnectionState === 'failed') {
      console.info('ICE connection disconnected or failed, ending call');
      endCall();
    }
  }, [iceConnectionState, callStatus, videoStatus, endCall]);

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

  const currentMediaDeviceIds: CurrentMediaDeviceIds = useMemo(() => {
    const createSetIdForDeviceKind = (mediaInputKind: MediaInputKind) => async (id: string | undefined) => {
      const mediaDeviceIds = {
        audio: audioInputDeviceId,
        video: videoDeviceId,
      };

      mediaDeviceIds[mediaInputKind] = id;

      await updateLocalStream(mediaDeviceIds);
    };

    return {
      audioinput: {
        id: audioInputDeviceId,
        setId: createSetIdForDeviceKind('audio'),
      },
      audiooutput: {
        id: audioOutputDeviceId,
        setId: setAudioOutputDeviceId,
      },
      videoinput: {
        id: videoDeviceId,
        setId: createSetIdForDeviceKind('video'),
      },
    };
  }, [updateLocalStream, audioInputDeviceId, audioOutputDeviceId, videoDeviceId]);

  if (!callData || !callRole) {
    console.error('Invalid route. Redirecting...');
    return <Navigate to={'/'} />;
  }

  return (
    <CallContext.Provider
      value={{
        mediaDevices,
        currentMediaDeviceIds,
        isAudioOn,
        setIsAudioOn,
        videoStatus,
        updateVideoStatus,
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
