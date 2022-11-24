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

import { WebRtcIceCandidate, WebRtcSdp, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { ConversationContext } from './ConversationProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IWebRtcContext {
  isConnected: boolean;

  remoteStreams: readonly MediaStream[] | undefined;
  webRtcConnection: RTCPeerConnection | undefined;

  sendWebRtcOffer: (sdp: RTCSessionDescriptionInit) => Promise<void>;
}

const defaultWebRtcContext: IWebRtcContext = {
  isConnected: false,
  remoteStreams: undefined,
  webRtcConnection: undefined,
  sendWebRtcOffer: async () => {},
};

export const WebRtcContext = createContext<IWebRtcContext>(defaultWebRtcContext);

export default ({ children }: WithChildren) => {
  const { account } = useAuthContext();
  const webSocket = useContext(WebSocketContext);
  const { conversation } = useContext(ConversationContext);
  const [webRtcConnection, setWebRtcConnection] = useState<RTCPeerConnection | undefined>();
  const [remoteStreams, setRemoteStreams] = useState<readonly MediaStream[]>();
  const [isConnected, setIsConnected] = useState(false);

  // TODO: This logic will have to change to support multiple people in a call
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  useEffect(() => {
    if (!webRtcConnection && account) {
      const iceServers: RTCIceServer[] = [];

      if (account.getDetails()['TURN.enable'] === 'true') {
        iceServers.push({
          urls: 'turn:' + account.getDetails()['TURN.server'],
          username: account.getDetails()['TURN.username'],
          credential: account.getDetails()['TURN.password'],
        });
      }

      if (account.getDetails()['STUN.enable'] === 'true') {
        iceServers.push({
          urls: 'stun:' + account.getDetails()['STUN.server'],
        });
      }

      setWebRtcConnection(new RTCPeerConnection({ iceServers: iceServers }));
    }
  }, [account, webRtcConnection]);

  const sendWebRtcOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      if (!webRtcConnection || !webSocket) {
        throw new Error('Could not send WebRTC offer');
      }

      const webRtcOffer: WebRtcSdp = {
        contactId: contactUri,
        sdp,
      };

      console.info('Sending WebRtcOffer', webRtcOffer);
      webSocket.send(WebSocketMessageType.WebRtcOffer, webRtcOffer);
      await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
    },
    [webRtcConnection, webSocket, contactUri]
  );

  const sendWebRtcAnswer = useCallback(
    (sdp: RTCSessionDescriptionInit) => {
      if (!webRtcConnection || !webSocket) {
        throw new Error('Could not send WebRTC answer');
      }

      const webRtcAnswer: WebRtcSdp = {
        contactId: contactUri,
        sdp,
      };

      console.info('Sending WebRtcAnswer', webRtcAnswer);
      webSocket.send(WebSocketMessageType.WebRtcAnswer, webRtcAnswer);
    },
    [contactUri, webRtcConnection, webSocket]
  );

  useEffect(() => {
    if (!webSocket || !webRtcConnection) {
      return;
    }

    const webRtcOfferListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcOffer', data);
      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));

      const sdp = await webRtcConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      sendWebRtcAnswer(sdp);
      await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
      setIsConnected(true);
    };

    const webRtcAnswerListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcAnswer', data);
      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      setIsConnected(true);
    };

    const webRtcIceCandidateListener = async (data: WebRtcIceCandidate) => {
      console.info('Received event on WebRtcIceCandidate', data);
      await webRtcConnection.addIceCandidate(data.candidate);
    };

    webSocket.bind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
    webSocket.bind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);
    webSocket.bind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
      webSocket.unbind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);
      webSocket.unbind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);
    };
  }, [webSocket, webRtcConnection, sendWebRtcAnswer]);

  useEffect(() => {
    if (!webRtcConnection || !webSocket) {
      return;
    }

    const iceCandidateEventListener = (event: RTCPeerConnectionIceEvent) => {
      console.info('Received WebRTC event on icecandidate', event);
      if (!contactUri) {
        throw new Error('Could not handle WebRTC event on icecandidate: contactUri is not defined');
      }

      if (event.candidate) {
        const webRtcIceCandidate: WebRtcIceCandidate = {
          contactId: contactUri,
          candidate: event.candidate,
        };

        console.info('Sending WebRtcIceCandidate', webRtcIceCandidate);
        webSocket.send(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidate);
      }
    };

    const trackEventListener = (event: RTCTrackEvent) => {
      console.info('Received WebRTC event on track', event);
      setRemoteStreams(event.streams);
    };

    webRtcConnection.addEventListener('icecandidate', iceCandidateEventListener);
    webRtcConnection.addEventListener('track', trackEventListener);

    return () => {
      webRtcConnection.removeEventListener('icecandidate', iceCandidateEventListener);
      webRtcConnection.removeEventListener('track', trackEventListener);
    };
  }, [webRtcConnection, webSocket, contactUri]);

  return (
    <WebRtcContext.Provider
      value={{
        isConnected,
        remoteStreams,
        webRtcConnection,
        sendWebRtcOffer,
      }}
    >
      {children}
    </WebRtcContext.Provider>
  );
};
