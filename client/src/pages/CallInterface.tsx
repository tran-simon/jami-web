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
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import {
  ComponentType,
  Fragment,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ExpandableButtonProps } from '../components/Button';
import {
  CallingChatButton,
  CallingEndButton,
  CallingExtensionButton,
  CallingFullScreenButton,
  CallingGroupButton,
  CallingMicButton,
  CallingMoreVerticalButton,
  CallingRecordButton,
  CallingScreenShareButton,
  CallingVideoCameraButton,
  CallingVolumeButton,
} from '../components/CallButtons';
import CallChatDrawer from '../components/CallChatDrawer';
import VideoOverlay from '../components/VideoOverlay';
import VideoStream from '../components/VideoStream';
import { CallContext, CallStatus, VideoStatus } from '../contexts/CallProvider';
import { useConversationContext } from '../contexts/ConversationProvider';
import { WebRtcContext } from '../contexts/WebRtcProvider';
import { VideoElementWithSinkId } from '../utils/utils';
import { CallPending } from './CallPending';
import CallPermissionDenied from './CallPermissionDenied';

export default () => {
  const { callStatus, isChatShown, isFullscreen } = useContext(CallContext);
  const callInterfaceRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!callInterfaceRef.current) {
      return;
    }

    if (isFullscreen && document.fullscreenElement === null) {
      callInterfaceRef.current.requestFullscreen();
    } else if (!isFullscreen && document.fullscreenElement !== null) {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  if (callStatus === CallStatus.PermissionsDenied) {
    return <CallPermissionDenied />;
  }
  if (callStatus !== CallStatus.InCall) {
    return <CallPending />;
  }

  return (
    <Box ref={callInterfaceRef} flexGrow={1} display="flex">
      <CallInterface />
      {isChatShown && <CallChatDrawer />}
    </Box>
  );
};

interface Props {
  children?: ReactNode;
}

const CallInterface = () => {
  const { localStream, screenShareLocalStream, remoteStreams } = useContext(WebRtcContext);
  const {
    currentMediaDeviceIds: {
      audiooutput: { id: audioOutDeviceId },
    },
    videoStatus,
  } = useContext(CallContext);
  const remoteVideoRef = useRef<VideoElementWithSinkId | null>(null);
  const gridItemRef = useRef<HTMLDivElement | null>(null);
  const [isLocalVideoZoomed, setIsLocalVideoZoomed] = useState(false);

  const stream = useMemo(() => {
    switch (videoStatus) {
      case VideoStatus.Camera:
        return localStream;
      case VideoStatus.ScreenShare:
        return screenShareLocalStream;
    }
  }, [videoStatus, localStream, screenShareLocalStream]);

  const hasSetSinkId = remoteVideoRef.current?.setSinkId != null;

  // TODO: For now, `remoteStream` is the first remote stream in the array.
  //       There should only be one in the array, but we should make sure this is right.
  const remoteStream = remoteStreams?.at(0);

  return (
    <Box display="flex" flexGrow={1}>
      <VideoStream
        ref={remoteVideoRef}
        stream={remoteStream}
        audioOutDeviceId={audioOutDeviceId}
        style={{ zIndex: -1, backgroundColor: 'black', position: 'absolute', height: '100%', width: '100%' }}
      />
      <Box flexGrow={1} margin={2} display="flex" flexDirection="column">
        {/* Guest video, takes the whole screen */}
        <CallInterfaceInformation />
        <Box flexGrow={1} marginY={2} position="relative">
          <VideoOverlay
            stream={stream}
            hidden={!stream}
            muted
            size={isLocalVideoZoomed ? 'large' : 'medium'}
            onClick={() => setIsLocalVideoZoomed((v) => !v)}
          />
        </Box>
        <Grid container>
          <Grid item xs />
          <Grid item sx={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <CallInterfacePrimaryButtons />
            </div>
          </Grid>
          <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }} ref={gridItemRef}>
            <CallInterfaceSecondaryButtons showVolumeButton={hasSetSinkId} gridItemRef={gridItemRef} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const formatElapsedSeconds = (elapsedSeconds: number): string => {
  const seconds = Math.floor(elapsedSeconds % 60);
  elapsedSeconds = Math.floor(elapsedSeconds / 60);
  const minutes = elapsedSeconds % 60;
  elapsedSeconds = Math.floor(elapsedSeconds / 60);
  const hours = elapsedSeconds % 24;

  const times: string[] = [];
  if (hours > 0) {
    times.push(hours.toString().padStart(2, '0'));
  }
  times.push(minutes.toString().padStart(2, '0'));
  times.push(seconds.toString().padStart(2, '0'));

  return times.join(':');
};

const CallInterfaceInformation = () => {
  const { callStartTime } = useContext(CallContext);
  const { conversation } = useConversationContext();
  const [elapsedTime, setElapsedTime] = useState(callStartTime ? (Date.now() - callStartTime) / 1000 : 0);
  const memberName = useMemo(() => conversation.getFirstMember().contact.registeredName, [conversation]);

  useEffect(() => {
    if (callStartTime) {
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - callStartTime) / 1000);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStartTime]);

  const elapsedTimerString = formatElapsedSeconds(elapsedTime);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="white" component="p">
        {memberName}
      </Typography>
      <Typography color="white" component="p">
        {elapsedTimerString}
      </Typography>
    </Stack>
  );
};

const CallInterfacePrimaryButtons = () => {
  return (
    <Card sx={{ backgroundColor: '#00000088', overflow: 'visible' }}>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <CallingMicButton />
        <CallingEndButton />
        <CallingVideoCameraButton />
      </Stack>
    </Card>
  );
};

const SECONDARY_BUTTONS = [
  CallingVolumeButton,
  CallingGroupButton,
  CallingChatButton,
  CallingScreenShareButton,
  CallingRecordButton,
  CallingExtensionButton,
  CallingFullScreenButton,
];

const CallInterfaceSecondaryButtons = ({
  gridItemRef,
  showVolumeButton,
}: Props & { showVolumeButton: boolean; gridItemRef: RefObject<HTMLElement> }) => {
  const stackRef = useRef<HTMLElement>(null);

  const [initialMeasurementDone, setInitialMeasurementDone] = useState(false);
  const [hiddenStackCount, setHiddenStackCount] = useState(0);
  const [hiddenMenuVisible, setHiddenMenuVisible] = useState(false);

  // Audio out options are only available on Chrome and other browsers that support `setSinkId`.
  // This removes the `CallingVolumeButton` if `setSinkId` is not defined.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId#browser_compatibility
  const secondaryButtons = useMemo(() => {
    return showVolumeButton ? SECONDARY_BUTTONS : SECONDARY_BUTTONS.slice(1);
  }, [showVolumeButton]);

  const calculateStackCount = useCallback(() => {
    if (stackRef?.current && gridItemRef?.current) {
      const buttonWidth = stackRef.current.children[0].clientWidth;
      const availableSpace = gridItemRef.current.clientWidth;
      let availableButtons = Math.floor((availableSpace - 1) / buttonWidth);
      if (availableButtons < secondaryButtons.length) {
        availableButtons -= 1; // Leave room for CallingMoreVerticalButton
      }
      setHiddenStackCount(secondaryButtons.length - availableButtons);
    }
  }, [gridItemRef, secondaryButtons]);

  useLayoutEffect(() => {
    // Run once, at the beginning, for initial measurements
    if (!initialMeasurementDone) {
      calculateStackCount();
      setInitialMeasurementDone(true);
    }

    const onResize = () => {
      calculateStackCount();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [calculateStackCount, initialMeasurementDone]);

  const { displayedButtons, hiddenButtons } = useMemo(() => {
    const displayedButtons: ComponentType<ExpandableButtonProps>[] = [];
    const hiddenButtons: ComponentType<ExpandableButtonProps>[] = [];
    for (let i = 0; i < secondaryButtons.length; i++) {
      const button = secondaryButtons[i];
      if (i < secondaryButtons.length - hiddenStackCount) {
        displayedButtons.push(button);
      } else {
        hiddenButtons.push(button);
      }
    }

    return {
      displayedButtons,
      hiddenButtons,
    };
  }, [hiddenStackCount, secondaryButtons]);

  return (
    <Card sx={{ backgroundColor: '#00000088', overflow: 'visible', height: '100%' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" height="100%" ref={stackRef}>
        {initialMeasurementDone &&
          displayedButtons.map((SecondaryButton, i) => (
            <Fragment key={i}>
              <SecondaryButton />
            </Fragment>
          ))}
        {(!!hiddenButtons.length || !initialMeasurementDone) && (
          <CallingMoreVerticalButton isVertical onClick={() => setHiddenMenuVisible(!hiddenMenuVisible)} />
        )}
      </Stack>

      {!!hiddenButtons.length && hiddenMenuVisible && (
        <Box sx={{ position: 'absolute', right: 0, bottom: '50px' }}>
          <Card sx={{ backgroundColor: '#00000088', overflow: 'visible', justifyContent: 'flex-end' }}>
            <Stack
              direction="column"
              justifyContent="flex-end"
              alignItems="flex-end"
              sx={{ bottom: 0, right: 0, height: '100%' }}
            >
              {hiddenButtons.map((SecondaryButton, i) => (
                <Fragment key={i}>
                  <SecondaryButton isVertical />
                </Fragment>
              ))}
            </Stack>
          </Card>
        </Box>
      )}
    </Card>
  );
};
