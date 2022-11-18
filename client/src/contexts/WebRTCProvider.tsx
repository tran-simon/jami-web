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
  AccountTextMessage,
  WebRTCAnswerMessage,
  WebRTCIceCandidate,
  WebRTCOfferMessage,
  WebSocketMessageType,
} from 'jami-web-common';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IWebRTCContext {
  localVideoRef: React.RefObject<HTMLVideoElement> | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement> | null;

  mediaDevices: Record<MediaDeviceKind, MediaDeviceInfo[]>;

  contactId: string;

  isAudioOn: boolean;
  setAudioStatus: (isOn: boolean) => void;
  isVideoOn: boolean;
  setVideoStatus: (isOn: boolean) => void;
  sendWebRTCOffer: () => void;
}

const defaultWebRTCContext: IWebRTCContext = {
  localVideoRef: null,
  remoteVideoRef: null,
  mediaDevices: {
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  },

  contactId: '',

  isAudioOn: false,
  setAudioStatus: () => {},
  isVideoOn: false,
  setVideoStatus: () => {},

  sendWebRTCOffer: () => {},
};

export const WebRTCContext = createContext<IWebRTCContext>(defaultWebRTCContext);

type WebRTCProviderProps = WithChildren & {
  contactId: string;
  isAudioOn?: boolean;
  isVideoOn?: boolean;
};

// TODO: This is a WIP. The calling logic will be improved in other CRs
export default ({
  children,
  isAudioOn: _isAudioOn = defaultWebRTCContext.isAudioOn,
  isVideoOn: _isVideoOn = defaultWebRTCContext.isVideoOn,
  contactId: _contactId = defaultWebRTCContext.contactId,
}: WebRTCProviderProps) => {
  const [isAudioOn, setIsAudioOn] = useState(_isAudioOn);
  const [isVideoOn, setIsVideoOn] = useState(_isVideoOn);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { account } = useAuthContext();
  const contactId = _contactId;
  const [webRTCConnection, setWebRTCConnection] = useState<RTCPeerConnection | undefined>();
  const localStreamRef = useRef<MediaStream>();
  const webSocket = useContext(WebSocketContext);
  const [mediaDevices, setMediaDevices] = useState<Record<MediaDeviceKind, MediaDeviceInfo[]>>(
    defaultWebRTCContext.mediaDevices
  );

  useEffect(() => {
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
    if (!webRTCConnection) {
      // TODO use SFL iceServers
      const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      setWebRTCConnection(new RTCPeerConnection(iceConfig));
    }
  }, [webRTCConnection]);

  useEffect(() => {
    if (!webRTCConnection) {
      return;
    }

    if (isVideoOn || isAudioOn) {
      try {
        // TODO: When toggling mute on/off, the camera flickers
        // https://git.jami.net/savoirfairelinux/jami-web/-/issues/90
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then((stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
              if (track.kind === 'audio') {
                track.enabled = isAudioOn;
              } else if (track.kind === 'video') {
                track.enabled = isVideoOn;
              }
              webRTCConnection.addTrack(track, stream);
            });
            localStreamRef.current = stream;
          });
      } catch (e) {
        console.error('Could not get media devices: ', e);
      }
    }

    const icecandidateEventListener = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && webSocket) {
        console.log('webRTCConnection : onicecandidate');
        webSocket.send(WebSocketMessageType.IceCandidate, {
          from: account.getId(),
          to: contactId,
          message: {
            candidate: event.candidate,
          },
        });
      }
    };

    const trackEventListener = (event: RTCTrackEvent) => {
      console.log('remote TrackEvent');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('webRTCConnection : add remotetrack success');
      }
    };

    webRTCConnection.addEventListener('icecandidate', icecandidateEventListener);
    webRTCConnection.addEventListener('track', trackEventListener);

    return () => {
      webRTCConnection.removeEventListener('icecandidate', icecandidateEventListener);
      webRTCConnection.removeEventListener('track', trackEventListener);
    };
  }, [webRTCConnection, isVideoOn, isAudioOn, webSocket, contactId, account]);

  useEffect(() => {
    if (!webRTCConnection || !webSocket) {
      return;
    }

    const webRTCOfferListener = async (data: AccountTextMessage<WebRTCOfferMessage>) => {
      if (webRTCConnection) {
        await webRTCConnection.setRemoteDescription(new RTCSessionDescription(data.message.sdp));
        const mySdp = await webRTCConnection.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await webRTCConnection.setLocalDescription(new RTCSessionDescription(mySdp));
        webSocket.send(WebSocketMessageType.WebRTCAnswer, {
          from: account.getId(),
          to: contactId,
          message: {
            sdp: mySdp,
          },
        });
      }
    };

    const webRTCAnswerListener = async (data: AccountTextMessage<WebRTCAnswerMessage>) => {
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(data.message.sdp));
      console.log('get answer');
    };

    const iceCandidateListener = async (data: AccountTextMessage<WebRTCIceCandidate>) => {
      await webRTCConnection.addIceCandidate(new RTCIceCandidate(data.message.candidate));
      console.log('webRTCConnection : candidate add success');
    };

    webSocket.bind(WebSocketMessageType.WebRTCOffer, webRTCOfferListener);
    webSocket.bind(WebSocketMessageType.WebRTCAnswer, webRTCAnswerListener);
    webSocket.bind(WebSocketMessageType.IceCandidate, iceCandidateListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRTCOffer, webRTCOfferListener);
      webSocket.unbind(WebSocketMessageType.WebRTCAnswer, webRTCAnswerListener);
      webSocket.unbind(WebSocketMessageType.IceCandidate, iceCandidateListener);
    };
  }, [account, contactId, webSocket, webRTCConnection]);

  const setAudioStatus = useCallback((isOn: boolean) => {
    setIsAudioOn(isOn);
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isOn;
    });
  }, []);

  const setVideoStatus = useCallback((isOn: boolean) => {
    setIsVideoOn(isOn);
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isOn;
    });
  }, []);

  const sendWebRTCOffer = useCallback(async () => {
    if (webRTCConnection && webSocket) {
      const sdp = await webRTCConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      webSocket.send(WebSocketMessageType.WebRTCOffer, {
        from: account.getId(),
        to: contactId,
        message: {
          sdp,
        },
      });
      await webRTCConnection.setLocalDescription(new RTCSessionDescription(sdp));
    }
  }, [account, contactId, webSocket, webRTCConnection]);

  return (
    <WebRTCContext.Provider
      value={{
        localVideoRef,
        remoteVideoRef,
        mediaDevices,
        contactId,
        isAudioOn,
        setAudioStatus,
        isVideoOn,
        setVideoStatus,
        sendWebRTCOffer,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
