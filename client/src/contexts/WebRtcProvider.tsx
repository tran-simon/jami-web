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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createOptionalContext } from '../hooks/createOptionalContext';
import { Conversation } from '../models/Conversation';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { CallManagerContext } from './CallManagerProvider';
import ConditionalContextProvider from './ConditionalContextProvider';
import { IWebSocketContext, WebSocketContext } from './WebSocketProvider';

export type MediaDevicesInfo = Record<MediaDeviceKind, MediaDeviceInfo[]>;
export type MediaInputKind = 'audio' | 'video';
export type MediaInputIds = Record<MediaInputKind, string | false | undefined>;

export interface IWebRtcContext {
  iceConnectionState: RTCIceConnectionState | undefined;

  localStream: MediaStream | undefined;
  screenShareLocalStream: MediaStream | undefined;
  remoteStreams: readonly MediaStream[] | undefined;
  getMediaDevices: () => Promise<MediaDevicesInfo>;
  updateLocalStream: (mediaDeviceIds?: MediaInputIds) => Promise<void>;
  updateScreenShare: (active: boolean) => Promise<MediaStream | undefined>;

  sendWebRtcOffer: () => Promise<void>;
  closeConnection: () => void;
}

const optionalWebRtcContext = createOptionalContext<IWebRtcContext>('WebRtcContext');
export const useWebRtcContext = optionalWebRtcContext.useOptionalContext;

// FIXME: Caller webcam not working for second call
export default ({ children }: WithChildren) => {
  const { account } = useAuthContext();
  const [webRtcConnection, setWebRtcConnection] = useState<RTCPeerConnection | undefined>();
  const webSocket = useContext(WebSocketContext);
  const { callConversation, callData } = useContext(CallManagerContext);

  useEffect(() => {
    if (webRtcConnection && !callData) {
      setWebRtcConnection(undefined);
      return;
    }

    if (!webRtcConnection && account && callData) {
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

      setWebRtcConnection(new RTCPeerConnection({ iceServers }));
    }
  }, [account, webRtcConnection, callData]);

  return (
    <ConditionalContextProvider
      Context={optionalWebRtcContext.Context}
      initialValue={undefined}
      conditions={{
        webRtcConnection,
        webSocket,
        conversation: callConversation,
        conversationId: callData?.conversationId,
      }}
      useContextValue={useWebRtcContextValue}
    >
      {children}
    </ConditionalContextProvider>
  );
};

const useWebRtcContextValue = ({
  conversation,
  conversationId,
  webRtcConnection,
  webSocket,
}: {
  webRtcConnection: RTCPeerConnection;
  webSocket: IWebSocketContext;
  conversation: Conversation;
  conversationId: string;
}) => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [screenShareLocalStream, setScreenShareLocalStream] = useState<MediaStream>();
  const [remoteStreams, setRemoteStreams] = useState<readonly MediaStream[]>();
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState | undefined>();

  const [audioRtcRtpSenders, setAudioRtcRtpSenders] = useState<RTCRtpSender[]>();
  const [videoRtcRtpSenders, setVideoRtcRtpSenders] = useState<RTCRtpSender[]>();

  // TODO: The ICE candidate queue is used to cache candidates that were received before `setRemoteDescription` was
  //       called. This is currently necessary, because the jami-daemon is unreliable as a WebRTC signaling channel,
  //       because messages can be received with a delay or out of order. This queue is a temporary workaround that
  //       should be replaced if there is a better way to send messages with the daemon.
  //       Relevant links:
  //       - https://github.com/w3c/webrtc-pc/issues/2519#issuecomment-622055440
  //       - https://stackoverflow.com/questions/57256828/how-to-fix-invalidstateerror-cannot-add-ice-candidate-when-there-is-no-remote-s
  const [isReadyForIceCandidates, setIsReadyForIceCandidates] = useState(false);
  const [iceCandidateQueue, setIceCandidateQueue] = useState<RTCIceCandidate[]>([]);

  // TODO: This logic will have to change to support multiple people in a call
  const contactUri = useMemo(() => conversation.getFirstMember().contact.getUri(), [conversation]);

  const getMediaDevices = useCallback(async (): Promise<MediaDevicesInfo> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // TODO: On Firefox, some devices can sometime be duplicated (2 devices can share the same deviceId). Using a map
      //       and then converting it to an array makes it so that there is no duplicate. If we find a way to prevent
      //       Firefox from listing 2 devices with the same deviceId, we can remove this logic.
      const newMediaDevices: Record<MediaDeviceKind, Record<string, MediaDeviceInfo>> = {
        audioinput: {},
        audiooutput: {},
        videoinput: {},
      };

      for (const device of devices) {
        newMediaDevices[device.kind][device.deviceId] = device;
      }

      return {
        audioinput: Object.values(newMediaDevices.audioinput),
        audiooutput: Object.values(newMediaDevices.audiooutput),
        videoinput: Object.values(newMediaDevices.videoinput),
      };
    } catch (e) {
      throw new Error('Could not get media devices', { cause: e });
    }
  }, []);

  const updateLocalStream = useCallback(
    async (mediaDeviceIds?: MediaInputIds) => {
      const devices = await getMediaDevices();

      let audioConstraint: MediaTrackConstraints | boolean = devices.audioinput.length !== 0;
      let videoConstraint: MediaTrackConstraints | boolean = devices.videoinput.length !== 0;

      if (!audioConstraint && !videoConstraint) {
        return;
      }

      if (mediaDeviceIds?.audio !== undefined) {
        audioConstraint = mediaDeviceIds.audio !== false ? { deviceId: mediaDeviceIds.audio } : false;
      }
      if (mediaDeviceIds?.video !== undefined) {
        videoConstraint = mediaDeviceIds.video !== false ? { deviceId: mediaDeviceIds.video } : false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraint,
          video: videoConstraint,
        });

        for (const track of stream.getTracks()) {
          track.enabled = false;
        }

        setLocalStream(stream);
      } catch (e) {
        throw new Error('Could not get media devices', { cause: e });
      }
    },
    [getMediaDevices]
  );

  const updateScreenShare = useCallback(
    async (isOn: boolean) => {
      if (isOn) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setScreenShareLocalStream(stream);
        return stream;
      } else {
        if (screenShareLocalStream) {
          for (const track of screenShareLocalStream.getTracks()) {
            track.stop();
          }
        }

        setScreenShareLocalStream(undefined);
      }
    },
    [screenShareLocalStream]
  );

  useEffect(() => {
    if ((!localStream && !screenShareLocalStream) || !webRtcConnection) {
      return;
    }

    const updateTracks = async (stream: MediaStream, kind: 'audio' | 'video') => {
      const senders = kind === 'audio' ? audioRtcRtpSenders : videoRtcRtpSenders;
      const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
      if (senders) {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < senders.length; i++) {
          // TODO: There is a bug where calling multiple times `addTrack` when changing an input device doesn't work.
          //       Calling `addTrack` doesn't trigger the `track` event listener for the other user.
          //       This workaround makes it possible to replace a track, but it could be improved by figuring out the
          //       proper way of changing a track.
          promises.push(
            senders[i].replaceTrack(tracks[i]).catch((e) => {
              console.error('Error replacing track:', e);
            })
          );
        }
        return Promise.all(promises);
      }

      // TODO: Currently, we do not support adding new devices. To enable this feature, we would need to implement
      //       the "Perfect negotiation" pattern to renegotiate after `addTrack`.
      //       https://blog.mozilla.org/webrtc/perfect-negotiation-in-webrtc/
      const newSenders = tracks.map((track) => webRtcConnection.addTrack(track, stream));
      if (kind === 'audio') {
        setAudioRtcRtpSenders(newSenders);
      } else {
        setVideoRtcRtpSenders(newSenders);
      }
    };

    if (localStream) {
      updateTracks(localStream, 'audio');
      updateTracks(localStream, 'video');
    }

    if (screenShareLocalStream) {
      updateTracks(screenShareLocalStream, 'video');
    }
  }, [localStream, screenShareLocalStream, webRtcConnection, audioRtcRtpSenders, videoRtcRtpSenders]);

  const sendWebRtcOffer = useCallback(async () => {
    const sdp = await webRtcConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    const webRtcOffer: WebRtcSdp = {
      contactId: contactUri,
      conversationId: conversationId,
      sdp,
    };

    await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
    console.info('Sending WebRtcOffer', webRtcOffer);
    webSocket.send(WebSocketMessageType.WebRtcOffer, webRtcOffer);
  }, [webRtcConnection, webSocket, conversationId, contactUri]);

  const sendWebRtcAnswer = useCallback(async () => {
    const sdp = await webRtcConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    const webRtcAnswer: WebRtcSdp = {
      contactId: contactUri,
      conversationId: conversationId,
      sdp,
    };

    await webRtcConnection.setLocalDescription(new RTCSessionDescription(sdp));
    console.info('Sending WebRtcAnswer', webRtcAnswer);
    webSocket.send(WebSocketMessageType.WebRtcAnswer, webRtcAnswer);
  }, [contactUri, conversationId, webRtcConnection, webSocket]);

  /* WebSocket Listeners */

  useEffect(() => {
    const addQueuedIceCandidates = async () => {
      console.info('WebRTC remote description has been set. Ready to receive ICE candidates');
      setIsReadyForIceCandidates(true);
      if (iceCandidateQueue.length !== 0) {
        console.warn(
          'Found queued ICE candidates that were added before `setRemoteDescription` was called. ' +
            'Adding queued ICE candidates...',
          iceCandidateQueue
        );

        await Promise.all(iceCandidateQueue.map((iceCandidate) => webRtcConnection.addIceCandidate(iceCandidate)));
      }
    };

    const webRtcOfferListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcOffer', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      await sendWebRtcAnswer();
      await addQueuedIceCandidates();
    };

    const webRtcAnswerListener = async (data: WebRtcSdp) => {
      console.info('Received event on WebRtcAnswer', data);
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      await webRtcConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      await addQueuedIceCandidates();
    };

    webSocket.bind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
    webSocket.bind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRtcOffer, webRtcOfferListener);
      webSocket.unbind(WebSocketMessageType.WebRtcAnswer, webRtcAnswerListener);
    };
  }, [webSocket, webRtcConnection, sendWebRtcAnswer, conversationId, iceCandidateQueue]);

  useEffect(() => {
    const webRtcIceCandidateListener = async (data: WebRtcIceCandidate) => {
      if (data.conversationId !== conversationId) {
        console.warn('Wrong incoming conversationId, ignoring action');
        return;
      }

      if (!data.candidate) {
        return;
      }

      if (isReadyForIceCandidates) {
        await webRtcConnection.addIceCandidate(data.candidate);
      } else {
        setIceCandidateQueue((v) => {
          v.push(data.candidate);
          return v;
        });
      }
    };

    webSocket.bind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.WebRtcIceCandidate, webRtcIceCandidateListener);
    };
  }, [webRtcConnection, webSocket, conversationId, isReadyForIceCandidates]);

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
      setIceConnectionState(webRtcConnection.iceConnectionState);
    };

    webRtcConnection.addEventListener('track', trackEventListener);
    webRtcConnection.addEventListener('iceconnectionstatechange', iceConnectionStateChangeEventListener);

    return () => {
      webRtcConnection.removeEventListener('track', trackEventListener);
      webRtcConnection.removeEventListener('iceconnectionstatechange', iceConnectionStateChangeEventListener);
    };
  }, [webRtcConnection]);

  const closeConnection = useCallback(() => {
    const stopStream = (stream: MediaStream) => {
      const localTracks = stream.getTracks();
      if (localTracks) {
        for (const track of localTracks) {
          track.stop();
        }
      }
    };

    if (localStream) {
      stopStream(localStream);
    }
    if (screenShareLocalStream) {
      stopStream(screenShareLocalStream);
    }

    webRtcConnection.close();
  }, [webRtcConnection, localStream, screenShareLocalStream]);

  return useMemo(
    () => ({
      iceConnectionState,
      localStream,
      screenShareLocalStream,
      remoteStreams,
      getMediaDevices,
      updateLocalStream,
      updateScreenShare,
      sendWebRtcOffer,
      closeConnection,
    }),
    [
      iceConnectionState,
      localStream,
      screenShareLocalStream,
      remoteStreams,
      getMediaDevices,
      updateLocalStream,
      updateScreenShare,
      sendWebRtcOffer,
      closeConnection,
    ]
  );
};
