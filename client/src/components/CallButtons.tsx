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

import { IconButton, IconButtonProps, PaletteColor } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { ChangeEvent, useContext, useMemo } from 'react';

import { CallContext, CallStatus, VideoStatus } from '../contexts/CallProvider';
import {
  ExpandableButton,
  ExpandableButtonProps,
  ExpandMenuRadioOption,
  ShapedButtonProps,
  ToggleIconButton,
} from './Button';
import {
  CallEndIcon,
  ChatBubbleIcon,
  ExtensionIcon,
  FullScreenIcon,
  GroupAddIcon,
  MicroIcon,
  MicroOffIcon,
  MoreVerticalIcon,
  PlaceAudioCallIcon,
  RecordingIcon,
  RoundCloseIcon,
  ScreenShareArrowIcon,
  ScreenShareStopIcon,
  VideoCameraIcon,
  VideoCameraOffIcon,
  VolumeIcon,
} from './SvgIcon';

const CallButton = styled((props: ExpandableButtonProps) => {
  return <ExpandableButton {...props} />;
})({
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

const ColoredCallButton = styled(
  ({
    paletteColor,
    Icon,
    ...props
  }: ShapedButtonProps & {
    paletteColor?: PaletteColor | ((theme: Theme) => PaletteColor);
  }) => {
    return (
      <IconButton {...props} disableRipple={true}>
        <Icon fontSize="inherit" />
      </IconButton>
    );
  }
)(({ theme, paletteColor = theme.palette.primary }) => {
  if (typeof paletteColor === 'function') {
    paletteColor = paletteColor(theme);
  }

  return {
    color: paletteColor.contrastText,
    backgroundColor: paletteColor.dark,
    '&:hover': {
      backgroundColor: paletteColor.main,
    },
    '&:disabled': {
      backgroundColor: theme.palette.action.disabled,
    },
  };
});

export const CallingChatButton = (props: ExpandableButtonProps) => {
  const { setIsChatShown } = useContext(CallContext);
  return (
    <CallButton
      aria-label="chat"
      Icon={ChatBubbleIcon}
      onClick={() => {
        setIsChatShown((v) => !v);
      }}
      {...props}
    />
  );
};

export const CallingEndButton = (props: ExpandableButtonProps) => {
  const { endCall } = useContext(CallContext);
  return (
    <ColoredCallButton
      paletteColor={(theme) => theme.palette.error}
      onClick={() => {
        endCall();
      }}
      aria-label="call end"
      Icon={CallEndIcon}
      {...props}
    />
  );
};

export const CallingExtensionButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="extensions" Icon={ExtensionIcon} {...props} />;
};

export const CallingFullScreenButton = (props: ExpandableButtonProps) => {
  const { setIsFullscreen } = useContext(CallContext);
  return (
    <CallButton
      aria-label="full screen"
      Icon={FullScreenIcon}
      onClick={() => {
        setIsFullscreen((v) => !v);
      }}
      {...props}
    />
  );
};

export const CallingGroupButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="group options" Icon={GroupAddIcon} {...props} />;
};

export const CallingMoreVerticalButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="more vertical" Icon={MoreVerticalIcon} {...props} />;
};

export const CallingRecordButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="recording options" Icon={RecordingIcon} {...props} />;
};

export const CallingScreenShareButton = (props: ExpandableButtonProps) => {
  return (
    <CallButton aria-label="screen share" expandMenuOnClick IconButtonComp={ToggleScreenShareIconButton} {...props} />
  );
};

const ToggleScreenShareIconButton = (props: IconButtonProps) => {
  const { videoStatus, updateVideoStatus } = useContext(CallContext);

  return (
    <ToggleIconButton
      IconOff={ScreenShareArrowIcon}
      IconOn={ScreenShareStopIcon}
      selected={videoStatus === VideoStatus.ScreenShare}
      toggle={() => {
        updateVideoStatus((v) => (v !== VideoStatus.ScreenShare ? VideoStatus.ScreenShare : VideoStatus.Off));
      }}
      {...props}
    />
  );
};

const useMediaDeviceExpandMenuOptions = (kind: MediaDeviceKind): ExpandMenuRadioOption[] | undefined => {
  const { currentMediaDeviceIds, mediaDevices } = useContext(CallContext);

  const options = useMemo(
    () =>
      mediaDevices[kind].map((device) => ({
        key: device.deviceId,
        description: device.label,
      })),
    [mediaDevices, kind]
  );

  const currentDevice = currentMediaDeviceIds[kind];

  if (options.length === 0) {
    return undefined;
  }
  return [
    {
      options,
      value: currentDevice.id ?? '',
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        currentDevice.setId(e.target.value);
      },
    },
  ];
};

export const CallingVolumeButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('audiooutput');

  return (
    <CallButton
      aria-label="volume options"
      expandMenuOnClick
      Icon={VolumeIcon}
      expandMenuOptions={options}
      {...props}
    />
  );
};

export const CallingMicButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('audioinput');

  return (
    <CallButton
      aria-label="microphone options"
      expandMenuOptions={options}
      IconButtonComp={ToggleAudioCameraIconButton}
      {...props}
    />
  );
};

const ToggleAudioCameraIconButton = (props: IconButtonProps) => {
  const { isAudioOn, setIsAudioOn } = useContext(CallContext);
  return (
    <ToggleIconButton
      IconOn={MicroIcon}
      IconOff={MicroOffIcon}
      selected={isAudioOn}
      toggle={() => setIsAudioOn((v) => !v)}
      {...props}
    />
  );
};

export const CallingVideoCameraButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('videoinput');

  return (
    <CallButton
      aria-label="camera options"
      expandMenuOptions={options}
      IconButtonComp={ToggleVideoCameraIconButton}
      {...props}
    />
  );
};

const ToggleVideoCameraIconButton = (props: IconButtonProps) => {
  const { videoStatus, updateVideoStatus } = useContext(CallContext);
  return (
    <ToggleIconButton
      IconOn={VideoCameraIcon}
      IconOff={VideoCameraOffIcon}
      selected={videoStatus === VideoStatus.Camera}
      toggle={() => {
        updateVideoStatus((v) => (v !== VideoStatus.Camera ? VideoStatus.Camera : VideoStatus.Off));
      }}
      {...props}
    />
  );
};

// Calling pending/receiving interface
export const CallingCancelButton = (props: IconButtonProps) => {
  const { endCall } = useContext(CallContext);

  return (
    <ColoredCallButton
      aria-label="cancel call"
      onClick={() => {
        endCall();
      }}
      Icon={CallEndIcon}
      paletteColor={(theme) => theme.palette.error}
      {...props}
    />
  );
};

export const CallingAnswerAudioButton = (props: IconButtonProps) => {
  const { acceptCall, callStatus } = useContext(CallContext);

  return (
    <ColoredCallButton
      disabled={callStatus === CallStatus.Loading || callStatus === CallStatus.Connecting}
      aria-label="answer call audio"
      onClick={() => {
        acceptCall(false);
      }}
      Icon={PlaceAudioCallIcon}
      paletteColor={(theme) => theme.palette.success}
      {...props}
    />
  );
};

export const CallingAnswerVideoButton = (props: IconButtonProps) => {
  const { acceptCall, callStatus } = useContext(CallContext);
  return (
    <ColoredCallButton
      disabled={callStatus === CallStatus.Connecting || callStatus === CallStatus.Loading}
      aria-label="answer call video"
      onClick={() => {
        acceptCall(true);
      }}
      paletteColor={(theme) => theme.palette.success}
      Icon={VideoCameraIcon}
      {...props}
    />
  );
};

export const CallingRefuseButton = (props: IconButtonProps) => {
  const { endCall } = useContext(CallContext);
  return (
    <ColoredCallButton
      aria-label="refuse call"
      onClick={() => {
        endCall();
      }}
      paletteColor={(theme) => theme.palette.error}
      Icon={RoundCloseIcon}
      {...props}
    />
  );
};
