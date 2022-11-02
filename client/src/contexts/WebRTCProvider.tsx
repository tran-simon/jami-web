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

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { connect, Socket } from 'socket.io-client';

import { WithChildren } from '../utils/utils';

/*
 * TODO: This socket is temporary, it will be replaced by the real socket
 * for communication with webrtc
 * */
const socket = connect(import.meta.env.VITE_SOCKET_URL, { transports: ['websocket'] });

interface IWebRTCContext {
  localVideoRef: React.RefObject<HTMLVideoElement> | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement> | null;
  socket: Socket;

  isAudioOn: boolean;
  setAudioStatus: (isOn: boolean) => void;
  isVideoOn: boolean;
  setVideoStatus: (isOn: boolean) => void;
  sendWebRTCOffer: () => void;
}

const defaultWebRTCContext: IWebRTCContext = {
  localVideoRef: null,
  remoteVideoRef: null,
  socket,

  isAudioOn: false,
  setAudioStatus: () => {},
  isVideoOn: false,
  setVideoStatus: () => {},

  sendWebRTCOffer: () => {},
};

export const WebRTCContext = createContext<IWebRTCContext>(defaultWebRTCContext);

type WebRTCProviderProps = WithChildren & {
  isAudioOn?: boolean;
  isVideoOn?: boolean;
};

// TODO: This is a WIP. The calling logic will be improved in other CRs
export default ({
  children,
  isAudioOn: _isAudioOn = defaultWebRTCContext.isAudioOn,
  isVideoOn: _isVideoOn = defaultWebRTCContext.isVideoOn,
}: WebRTCProviderProps) => {
  const [isAudioOn, setIsAudioOn] = useState(_isAudioOn);
  const [isVideoOn, setIsVideoOn] = useState(_isVideoOn);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [webRTCConnection, setWebRTCConnection] = useState<RTCPeerConnection | undefined>();
  const localStreamRef = useRef<MediaStream>();

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
      if (event.candidate) {
        console.log('webRTCConnection : onicecandidate');
        socket.emit('candidate', event.candidate);
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
  }, [webRTCConnection, isVideoOn, isAudioOn]);

  useEffect(() => {
    if (!webRTCConnection) {
      return;
    }

    const sendWebRTCAnswer = async (remoteSdp: RTCSessionDescriptionInit) => {
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const mySdp = await webRTCConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await webRTCConnection.setLocalDescription(new RTCSessionDescription(mySdp));
      socket.emit('answer', mySdp);
    };

    const handleWebRTCAnswer = async (remoteSdp: RTCSessionDescriptionInit) => {
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(remoteSdp));
    };

    const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
      await webRTCConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on('getOffer', (remoteSdp: RTCSessionDescription) => {
      sendWebRTCAnswer(remoteSdp);
      console.log('get offer and aswering');
    });

    socket.on('getAnswer', (remoteSdp: RTCSessionDescription) => {
      handleWebRTCAnswer(remoteSdp);
      console.log('get answer');
    });

    socket.on('getCandidate', (candidate: RTCIceCandidateInit) => {
      addIceCandidate(candidate);
      console.log('webRTCConnection : candidate add success');
    });

    return () => {
      socket.off('getOffer');
      socket.off('getAnswer');
      socket.off('getCandidate');
    };
  }, [webRTCConnection]);

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
    if (webRTCConnection) {
      webRTCConnection
        .createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        .then((sdp) => {
          socket.emit('offer', sdp);
          webRTCConnection.setLocalDescription(new RTCSessionDescription(sdp));
        });
    }
  }, [webRTCConnection]);

  return (
    <WebRTCContext.Provider
      value={{
        localVideoRef,
        remoteVideoRef,
        socket,
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
