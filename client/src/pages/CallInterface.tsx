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
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import {
  ComponentType,
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Draggable from 'react-draggable';

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
import WebRTCProvider, { WebRTCContext } from '../contexts/WebRTCProvider';
import { CallRouteParams } from '../router';
import { useUrlParams } from '../utils/hooks';

export default () => {
  const {
    queryParams: { video },
  } = useUrlParams<CallRouteParams>();
  return (
    //TODO: set contactID
    <WebRTCProvider isVideoOn={video === 'true'} contactId={'contactIdToBeAdded'}>
      <CallInterface />
    </WebRTCProvider>
  );
};

interface Props {
  children?: ReactNode;
}

const CallInterface = () => {
  const { localVideoRef, remoteVideoRef, isVideoOn } = useContext(WebRTCContext);
  const gridItemRef = useRef(null);

  return (
    <>
      {/* Guest video, takes the whole screen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ backgroundColor: 'black', width: '100%', height: '100%', position: 'absolute' }}
      />
      <Stack
        position="absolute"
        direction="column"
        spacing={1}
        margin={2}
        sx={{ left: 0, right: 0, top: 0, bottom: 0 }}
      >
        {/* Top panel with guest information */}
        <Box>
          <CallInterfaceInformation />
        </Box>
        {/* Local video, with empty space to be moved around and stickied to walls */}
        <Box height="100%">
          {isVideoOn && (
            <Draggable bounds="parent" nodeRef={localVideoRef ?? undefined}>
              <video
                ref={localVideoRef}
                autoPlay
                style={{
                  position: 'absolute',
                  right: 0,
                  zIndex: 2,
                  borderRadius: '12px',
                  minWidth: '25%',
                  minHeight: '25%',
                  maxWidth: '50%',
                  maxHeight: '50%',
                }}
              />
            </Draggable>
          )}
        </Box>
        {/* Bottom panel with calling buttons */}
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
      </Stack>
    </>
  );
};

const CallInterfaceInformation = () => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="white" component="p">
        Alain Thérieur
      </Typography>
      <Typography color="white" component="p">
        01:23
      </Typography>
    </Stack>
  );
};

const CallInterfacePrimaryButtons = () => {
  const { sendWebRTCOffer } = useContext(WebRTCContext);

  return (
    <Card sx={{ backgroundColor: '#00000088', overflow: 'visible' }}>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            sendWebRTCOffer();
          }}
        >
          {/* TODO: Remove this button and make calling automatic (https://git.jami.net/savoirfairelinux/jami-web/-/issues/91)*/}
          Call
        </Button>
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
                  <SecondaryButton vertical />
                </Fragment>
              ))}
            </Stack>
          </Card>
        </Box>
      )}
    </Card>
  );
};
