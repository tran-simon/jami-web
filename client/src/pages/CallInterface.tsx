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
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Draggable from 'react-draggable';
import { useLocation } from 'react-router-dom';

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
import { CallContext, CallStatus } from '../contexts/CallProvider';
import { ConversationContext } from '../contexts/ConversationProvider';
import { CallPending } from './CallPending';

export default () => {
  const { callRole, callStatus, isChatShown, isFullscreen } = useContext(CallContext);
  const callInterfaceRef = useRef<HTMLDivElement>();
  const { state } = useLocation();

  useEffect(() => {
    if (!callInterfaceRef.current) {
      return;
    }

    if (isFullscreen && document.fullscreenElement === null) {
      callInterfaceRef.current.requestFullscreen();
    } else if (!isFullscreen && document.fullscreenEnabled !== null) {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  if (callStatus !== CallStatus.InCall) {
    return (
      <CallPending
        pending={callRole}
        caller={callStatus === CallStatus.Connecting ? 'connecting' : 'calling'}
        medium={state?.isVideoOn ? 'video' : 'audio'}
      />
    );
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
  const { isVideoOn, localStream, remoteStream, callStartTime } = useContext(CallContext);
  const gridItemRef = useRef(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [elapsedTime, setElapsedTime] = useState<number>();

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callStartTime) {
      const interval = setInterval(() => {
        setElapsedTime((new Date().getTime() - callStartTime.getTime()) / 1000);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStartTime]);

  return (
    <Box display="flex" flexGrow={1}>
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ zIndex: -1, backgroundColor: 'black', position: 'absolute', height: '100%', width: '100%' }}
      />
      <Box flexGrow={1} margin={2} display="flex" flexDirection="column">
        {/* Guest video, takes the whole screen */}
        <CallInterfaceInformation elapsedTime={elapsedTime} />
        <Box flexGrow={1} marginY={2} position="relative">
          <Draggable bounds="parent" nodeRef={localVideoRef ?? undefined}>
            <video
              ref={localVideoRef}
              autoPlay
              style={{
                position: 'absolute',
                right: 0,
                borderRadius: '12px',
                maxHeight: '50%',
                maxWidth: '50%',
                visibility: isVideoOn ? 'visible' : 'hidden',
              }}
            />
          </Draggable>
        </Box>
        <Grid container>
          <Grid item xs />
          <Grid item sx={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <CallInterfacePrimaryButtons />
            </div>
          </Grid>
          <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }} ref={gridItemRef}>
            <CallInterfaceSecondaryButtons gridItemRef={gridItemRef} />
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

interface CallInterfaceInformationProps {
  elapsedTime?: number;
}

const CallInterfaceInformation = ({ elapsedTime = 0 }: CallInterfaceInformationProps) => {
  const { conversation } = useContext(ConversationContext);
  const memberName = useMemo(() => conversation.getFirstMember().contact.getRegisteredName(), [conversation]);
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

const CallInterfaceSecondaryButtons = (props: Props & { gridItemRef: React.RefObject<HTMLElement> }) => {
  const stackRef = useRef<HTMLElement>(null);

  const [initialMeasurementDone, setInitialMeasurementDone] = useState(false);
  const [hiddenStackCount, setHiddenStackCount] = useState(0);
  const [hiddenMenuVisible, setHiddenMenuVisible] = useState(false);

  const calculateStackCount = useCallback(() => {
    if (stackRef?.current && props.gridItemRef?.current) {
      const buttonWidth = stackRef.current.children[0].clientWidth;
      const availableSpace = props.gridItemRef.current.clientWidth;
      let availableButtons = Math.floor((availableSpace - 1) / buttonWidth);
      if (availableButtons < SECONDARY_BUTTONS.length) {
        availableButtons -= 1; // Leave room for CallingMoreVerticalButton
      }
      setHiddenStackCount(SECONDARY_BUTTONS.length - availableButtons);
    }
  }, [props.gridItemRef]);

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
    SECONDARY_BUTTONS.forEach((button, i) => {
      if (i < SECONDARY_BUTTONS.length - hiddenStackCount) {
        displayedButtons.push(button);
      } else {
        hiddenButtons.push(button);
      }
    });

    return {
      displayedButtons,
      hiddenButtons,
    };
  }, [hiddenStackCount]);

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
