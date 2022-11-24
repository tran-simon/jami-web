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
import { AccountTextMessage, WebSocketMessageType } from 'jami-web-common';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useUrlParams } from '../hooks/useUrlParams';
import { CallRouteParams } from '../router';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { ConversationContext } from './ConversationProvider';
import { WebRTCContext } from './WebRTCProvider';
import { WebSocketContext } from './WebSocketProvider';

export type CallRole = 'caller' | 'receiver';

export enum CallStatus {
  Default = 1,
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
  callRole: CallRole;
  callStatus: CallStatus;

  acceptCall: () => void;
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
  callRole: 'caller',
  callStatus: CallStatus.Default,

  acceptCall: () => {},
};

export const CallContext = createContext<ICallContext>(defaultCallContext);

export default ({ children }: WithChildren) => {
  const {
    queryParams: { role: callRole },
    state: routeState,
  } = useUrlParams<CallRouteParams>();
  const { accountId } = useAuthContext();
  const webSocket = useContext(WebSocketContext);
  const { webRTCConnection, remoteStreams, sendWebRTCOffer, isConnected } = useContext(WebRTCContext);
  const { conversation, conversationId } = useContext(ConversationContext);

  const [mediaDevices, setMediaDevices] = useState<Record<MediaDeviceKind, MediaDeviceInfo[]>>(
    defaultCallContext.mediaDevices
  );
  const [localStream, setLocalStream] = useState<MediaStream>();

  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callStatus, setCallStatus] = useState(routeState?.callStatus);

  // TODO: This logic will have to change to support multiple people in a call
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // TODO: Only ask media permission once the call has been accepted
    try {
      // TODO: When toggling mute on/off, the camera flickers
      // https://git.jami.net/savoirfairelinux/jami-web/-/issues/90
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
  }, [setLocalStream]);

  useEffect(() => {
    if (localStream && webRTCConnection) {
      for (const track of localStream.getTracks()) {
        webRTCConnection.addTrack(track, localStream);
      }
    }
  }, [localStream, webRTCConnection]);

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    if (callRole === 'caller' && callStatus === CallStatus.Default) {
      const callBegin = {
        from: accountId,
        to: contactUri,
        message: {
          conversationId: conversationId,
        },
      };

      console.info('Sending CallBegin', callBegin);
      webSocket.send(WebSocketMessageType.CallBegin, callBegin);
      setCallStatus(CallStatus.Ringing);
    }
  }, [webSocket, callRole, callStatus, contactUri, accountId, conversationId]);

  useEffect(() => {
    if (!webSocket || !webRTCConnection) {
      return;
    }

    if (callRole === 'caller' && callStatus === CallStatus.Ringing) {
      const callAcceptListener = (data: AccountTextMessage<undefined>) => {
        console.info('Received event on CallAccept', data);
        setCallStatus(CallStatus.Connecting);

        webRTCConnection
          .createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then((offerSDP) => {
            sendWebRTCOffer(offerSDP);
          });
      };

      webSocket.bind(WebSocketMessageType.CallAccept, callAcceptListener);

      return () => {
        webSocket.unbind(WebSocketMessageType.CallAccept, callAcceptListener);
      };
    }
  }, [callRole, webSocket, webRTCConnection, sendWebRTCOffer, callStatus]);

  useEffect(() => {
    if (callStatus === CallStatus.Connecting && isConnected) {
      console.info('Changing call status to InCall');
      setCallStatus(CallStatus.InCall);
    }
  }, [isConnected, callStatus]);

  const acceptCall = useCallback(() => {
    if (!webSocket) {
      throw new Error('Could not accept call');
    }

    const callAccept = {
      from: accountId,
      to: contactUri,
      message: undefined,
    };

    console.info('Sending CallAccept', callAccept);
    webSocket.send(WebSocketMessageType.CallAccept, callAccept);
    setCallStatus(CallStatus.Connecting);
  }, [webSocket, accountId, contactUri]);

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

  if (!callRole || !callStatus) {
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
        callRole,
        callStatus,
        acceptCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
