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

import LoadingPage from '../components/Loading';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { ConversationContext } from './ConversationProvider';
import { IWebSocketContext, WebSocketContext } from './WebSocketProvider';

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
  const [webRtcConnection, setWebRtcConnection] = useState<RTCPeerConnection | undefined>();
  const webSocket = useContext(WebSocketContext);

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

  if (!webRtcConnection || !webSocket) {
    return <LoadingPage />;
  }

  return (
    <WebRtcProvider webRtcConnection={webRtcConnection} webSocket={webSocket}>
      {children}
    </WebRtcProvider>
  );
};

const WebRtcProvider = ({
  children,
  webRtcConnection,
  webSocket,
}: WithChildren & {
  webRtcConnection: RTCPeerConnection;
  webSocket: IWebSocketContext;
}) => {
  const { conversation, conversationId } = useContext(ConversationContext);
  const [remoteStreams, setRemoteStreams] = useState<readonly MediaStream[]>();
  const [isConnected, setIsConnected] = useState(false);

  // TODO: This logic will have to change to support multiple people in a call
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  const sendWebRtcOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const webRtcOffer: WebRtcSdp = {
        contactId: contactUri,
        conversationId: conversationId,
        sdp,
      };

      await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
      console.info('Sending WebRtcOffer', webRtcOffer);
      webSocket.send(WebSocketMessageType.WebRtcOffer, webRtcOffer);
    },
    [webRtcConnection, webSocket, conversationId, contactUri]
  );

  const sendWebRtcAnswer = useCallback(
    (sdp: RTCSessionDescriptionInit) => {
      const webRtcAnswer: WebRtcSdp = {
        contactId: contactUri,
        conversationId: conversationId,
        sdp,
      };

      console.info('Sending WebRtcAnswer', webRtcAnswer);
      webSocket.send(WebSocketMessageType.WebRtcAnswer, webRtcAnswer);
    },
    [contactUri, conversationId, webSocket]
  );

  /* WebSocket Listeners */

  useEffect(() => {
    const webRtcOfferListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcOffer', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));

      const sdp = await webRtcConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
      sendWebRtcAnswer(sdp);
    };

    const webRtcAnswerListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcAnswer', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    };
    webSocket.bind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
    webSocket.bind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
      webSocket.unbind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);
    };
  }, [webSocket, webRtcConnection, sendWebRtcAnswer, conversationId]);

  useEffect(() => {
    const webRtcIceCandidateListener = async (data: WebRtcIceCandidate) => {
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      await webRtcConnection.addIceCandidate(data.candidate);
    };

    webSocket.bind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);
    };
  }, [webRtcConnection, webSocket, conversationId]);

  /* WebRTC Listeners */

  useEffect(() => {
    const iceCandidateEventListener = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        const webRtcIceCandidate: WebRtcIceCandidate = {
          contactId: contactUri,
          conversationId: conversationId,
          candidate: event.candidate,
        };

        webSocket.send(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidate);
      }
    };

    webRtcConnection.addEventListener('icecandidate', iceCandidateEventListener);

    return () => {
      webRtcConnection.removeEventListener('icecandidate', iceCandidateEventListener);
    };
  }, [webRtcConnection, webSocket, contactUri, conversationId]);

  useEffect(() => {
    const trackEventListener = (event: RTCTrackEvent) => {
      console.info('Received WebRTC event on track', event);
      setRemoteStreams(event.streams);
    };

    const iceConnectionStateChangeEventListener = (event: Event) => {
      console.info(`Received WebRTC event on iceconnectionstatechange: ${webRtcConnection.iceConnectionState}`, event);
      setIsConnected(
        webRtcConnection.iceConnectionState === 'connected' || webRtcConnection.iceConnectionState === 'completed'
      );
    };

    webRtcConnection.addEventListener('track', trackEventListener);
    webRtcConnection.addEventListener('iceconnectionstatechange', iceConnectionStateChangeEventListener);

    return () => {
      webRtcConnection.removeEventListener('track', trackEventListener);
      webRtcConnection.removeEventListener('iceconnectionstatechange', iceConnectionStateChangeEventListener);
    };
  }, [webRtcConnection]);

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
