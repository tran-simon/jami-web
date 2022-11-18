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

import { AccountTextMessage, WebRTCIceCandidate, WebRtcSdp, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { ConversationContext } from './ConversationProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IWebRTCContext {
  isConnected: boolean;

  remoteStreams: readonly MediaStream[] | undefined;
  webRTCConnection: RTCPeerConnection | undefined;

  sendWebRTCOffer: (sdp: RTCSessionDescriptionInit) => Promise<void>;
}

const defaultWebRTCContext: IWebRTCContext = {
  isConnected: false,
  remoteStreams: undefined,
  webRTCConnection: undefined,
  sendWebRTCOffer: async () => {},
};

export const WebRTCContext = createContext<IWebRTCContext>(defaultWebRTCContext);

export default ({ children }: WithChildren) => {
  const { accountId } = useAuthContext();
  const webSocket = useContext(WebSocketContext);
  const { conversation } = useContext(ConversationContext);
  const [webRTCConnection, setWebRTCConnection] = useState<RTCPeerConnection | undefined>();
  const [remoteStreams, setRemoteStreams] = useState<readonly MediaStream[]>();
  const [isConnected, setIsConnected] = useState(false);

  // TODO: This logic will have to change to support multiple people in a call
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
    if (!webRTCConnection) {
      // TODO use SFL iceServers
      const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      setWebRTCConnection(new RTCPeerConnection(iceConfig));
    }
  }, [webRTCConnection]);

  const sendWebRTCOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      if (!webRTCConnection || !webSocket) {
        throw new Error('Could not send WebRTC offer');
      }
      const webRTCOffer: AccountTextMessage<WebRtcSdp> = {
        from: accountId,
        to: contactUri,
        message: {
          sdp,
        },
      };

      console.info('Sending WebRTCOffer', webRTCOffer);
      webSocket.send(WebSocketMessageType.WebRTCOffer, webRTCOffer);
      await webRTCConnection.setLocalDescription(new RTCSessionDescription(sdp));
    },
    [accountId, webRTCConnection, webSocket, contactUri]
  );

  const sendWebRTCAnswer = useCallback(
    (sdp: RTCSessionDescriptionInit) => {
      if (!webRTCConnection || !webSocket) {
        throw new Error('Could not send WebRTC answer');
      }

      const webRTCAnswer: AccountTextMessage<WebRtcSdp> = {
        from: accountId,
        to: contactUri,
        message: {
          sdp,
        },
      };

      console.info('Sending WebRTCAnswer', webRTCAnswer);
      webSocket.send(WebSocketMessageType.WebRTCAnswer, webRTCAnswer);
    },
    [accountId, contactUri, webRTCConnection, webSocket]
  );

  useEffect(() => {
    if (!webSocket || !webRTCConnection) {
      return;
    }

    const webRTCOfferListener = async (data: AccountTextMessage<WebRtcSdp>) => {
      console.info('Received event on WebRTCOffer', data);
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(data.message.sdp));

      const sdp = await webRTCConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      sendWebRTCAnswer(sdp);
      await webRTCConnection.setLocalDescription(new RTCSessionDescription(sdp));
      setIsConnected(true);
    };

    const webRTCAnswerListener = async (data: AccountTextMessage<WebRtcSdp>) => {
      console.info('Received event on WebRTCAnswer', data);
      await webRTCConnection.setRemoteDescription(new RTCSessionDescription(data.message.sdp));
      setIsConnected(true);
    };

    const webRTCIceCandidateListener = async (data: AccountTextMessage<WebRTCIceCandidate>) => {
      console.info('Received event on WebRTCIceCandidate', data);
      await webRTCConnection.addIceCandidate(data.message.candidate);
    };

    webSocket.bind(WebSocketMessageType.WebRTCOffer, webRTCOfferListener);
    webSocket.bind(WebSocketMessageType.WebRTCAnswer, webRTCAnswerListener);
    webSocket.bind(WebSocketMessageType.IceCandidate, webRTCIceCandidateListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRTCOffer, webRTCOfferListener);
      webSocket.unbind(WebSocketMessageType.WebRTCAnswer, webRTCAnswerListener);
      webSocket.unbind(WebSocketMessageType.IceCandidate, webRTCIceCandidateListener);
    };
  }, [webSocket, webRTCConnection, sendWebRTCAnswer]);

  useEffect(() => {
    if (!webRTCConnection || !webSocket) {
      return;
    }

    const icecandidateEventListener = (event: RTCPeerConnectionIceEvent) => {
      console.info('Received WebRTC event on icecandidate', event);
      if (!contactUri) {
        throw new Error('Could not handle WebRTC event on icecandidate: contactUri is not defined');
      }
      if (event.candidate) {
        const iceCandidateMessageData: AccountTextMessage<WebRTCIceCandidate> = {
          from: accountId,
          to: contactUri,
          message: {
            candidate: event.candidate,
          },
        };

        console.info('Sending IceCandidate', iceCandidateMessageData);
        webSocket.send(WebSocketMessageType.IceCandidate, iceCandidateMessageData);
      }
    };
    const trackEventListener = (event: RTCTrackEvent) => {
      console.info('Received WebRTC event on track', event);
      setRemoteStreams(event.streams);
    };

    webRTCConnection.addEventListener('icecandidate', icecandidateEventListener);
    webRTCConnection.addEventListener('track', trackEventListener);

    return () => {
      webRTCConnection.removeEventListener('icecandidate', icecandidateEventListener);
      webRTCConnection.removeEventListener('track', trackEventListener);
    };
  }, [accountId, webRTCConnection, webSocket, contactUri]);

  return (
    <WebRTCContext.Provider
      value={{
        isConnected,
        remoteStreams,
        webRTCConnection,
        sendWebRTCOffer,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
