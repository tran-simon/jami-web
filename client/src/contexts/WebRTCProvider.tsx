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

import React, { createContext, useCallback, useRef } from 'react';
import { connect, Socket } from 'socket.io-client';

import { WithChildren } from '../utils/utils';

/*
 * TODO: This socket is temporary, it will be replaced by the real socket
 * for communication with webrtc
 * */
const socket = connect('http://192.168.0.12:8080', { transports: ['websocket'] });

interface IWebRTCContext {
  localVideoRef: React.RefObject<HTMLVideoElement> | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement> | null;
  createWebRTCConnection: () => void;
  sendWebRTCOffer: () => void;
  sendWebRTCAnswer: (remoteSdp: RTCSessionDescriptionInit) => void;
  handleWebRTCAnswer: (remoteSdp: RTCSessionDescriptionInit) => void;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;
  socket: Socket;
}

const DefaultWebRTCContext: IWebRTCContext = {
  localVideoRef: null,
  remoteVideoRef: null,
  createWebRTCConnection: () => {},
  sendWebRTCOffer: () => {},
  sendWebRTCAnswer: () => {},
  handleWebRTCAnswer: () => {},
  addIceCandidate: () => {},
  socket: socket,
};

export const WebRTCContext = createContext<IWebRTCContext>(DefaultWebRTCContext);

export default ({ children }: WithChildren) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCConnectionRef = useRef<RTCPeerConnection>();

  const createWebRTCConnection = useCallback(async () => {
    //TODO use SFL iceServers
    const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    webRTCConnectionRef.current = new RTCPeerConnection(iceConfig);
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    localStream.getTracks().forEach((track) => {
      if (webRTCConnectionRef.current) {
        webRTCConnectionRef.current.addTrack(track, localStream);
      }
    });
    webRTCConnectionRef.current.addEventListener('icecandidate', (event) => {
      if (event.candidate && socket) {
        console.log('webRTCConnection : onicecandidate');
        socket.emit('candidate', event.candidate);
      }
    });
    webRTCConnectionRef.current.addEventListener('track', async (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('webRTCConnection : add remotetrack success');
      }
    });
  }, [webRTCConnectionRef, localVideoRef, remoteVideoRef]);

  const sendWebRTCOffer = useCallback(async () => {
    try {
      if (webRTCConnectionRef.current && socket) {
        const sdp = await webRTCConnectionRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await webRTCConnectionRef.current.setLocalDescription(new RTCSessionDescription(sdp));
        socket.emit('offer', sdp);
      }
    } catch (e) {
      console.error(e);
    }
  }, [webRTCConnectionRef]);

  const sendWebRTCAnswer = useCallback(
    async (remoteSdp: RTCSessionDescriptionInit) => {
      try {
        if (webRTCConnectionRef.current && socket && remoteSdp) {
          await webRTCConnectionRef.current.setRemoteDescription(new RTCSessionDescription(remoteSdp));
          const mySdp = await webRTCConnectionRef.current.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await webRTCConnectionRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
          socket.emit('answer', mySdp);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [webRTCConnectionRef]
  );

  const handleWebRTCAnswer = useCallback(
    async (remoteSdp: RTCSessionDescriptionInit) => {
      try {
        if (webRTCConnectionRef.current && remoteSdp) {
          await webRTCConnectionRef.current.setRemoteDescription(new RTCSessionDescription(remoteSdp));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [webRTCConnectionRef]
  );

  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        if (webRTCConnectionRef.current) {
          await webRTCConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [webRTCConnectionRef]
  );

  return (
    <WebRTCContext.Provider
      value={{
        localVideoRef,
        remoteVideoRef,
        createWebRTCConnection,
        sendWebRTCOffer,
        sendWebRTCAnswer,
        handleWebRTCAnswer,
        addIceCandidate,
        socket,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
