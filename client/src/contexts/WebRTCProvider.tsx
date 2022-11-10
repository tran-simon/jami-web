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

import { WebRTCIceCandidate, WebRTCSDP, WebSocketMessage, WebSocketMessageType } from 'jami-web-common';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IWebRTCContext {
  localVideoRef: React.RefObject<HTMLVideoElement> | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement> | null;

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
  const socket = useContext(WebSocketContext);

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
      if (event.candidate && socket) {
        console.log('webRTCConnection : onicecandidate');
        socket.send({
          type: WebSocketMessageType.IceCandidate,
          data: {
            from: account.getId(),
            to: contactId,
            message: {
              candidate: event.candidate,
            },
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
  }, [webRTCConnection, isVideoOn, isAudioOn, socket, contactId, account]);

  useEffect(() => {
    if (!webRTCConnection || !socket) {
      return;
    }

    const sendWebRTCAnswer = async (message: WebSocketMessage) => {
      if (webRTCConnection && socket) {
        const remoteSdp: RTCSessionDescriptionInit = (message.data.message as WebRTCSDP).sdp;
        await webRTCConnection.setRemoteDescription(new RTCSessionDescription(remoteSdp));
        const mySdp = await webRTCConnection.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await webRTCConnection.setLocalDescription(new RTCSessionDescription(mySdp));
        socket.send({
          type: WebSocketMessageType.WebRTCAnswer,
          data: {
            from: account.getId(),
            to: contactId,
            message: {
              sdp: mySdp,
            },
          },
        });
        console.log('get offer and aswering');
      }
    };

    const handleWebRTCAnswer = async (message: WebSocketMessage) => {
      const remoteSdp: RTCSessionDescriptionInit = (message.data.message as WebRTCSDP).sdp;
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      console.log('get answer');
    };

    const addIceCandidate = async (message: WebSocketMessage) => {
      const candidate: RTCIceCandidateInit = (message.data.message as WebRTCIceCandidate).candidate;
      await webRTCConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('webRTCConnection : candidate add success');
    };

    socket.bind(WebSocketMessageType.WebRTCOffer, sendWebRTCAnswer);
    socket.bind(WebSocketMessageType.WebRTCAnswer, handleWebRTCAnswer);
    socket.bind(WebSocketMessageType.IceCandidate, addIceCandidate);
  }, [account, contactId, socket, webRTCConnection]);

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
    if (webRTCConnection && socket) {
      const sdp = await webRTCConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      socket.send({
        type: WebSocketMessageType.WebRTCOffer,
        data: {
          from: account.getId(),
          to: contactId,
          message: {
            sdp,
          },
        },
      });
      await webRTCConnection.setLocalDescription(new RTCSessionDescription(sdp));
    }
  }, [account, contactId, socket, webRTCConnection]);

  return (
    <WebRTCContext.Provider
      value={{
        localVideoRef,
        remoteVideoRef,
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
