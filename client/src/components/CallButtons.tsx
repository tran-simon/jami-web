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
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CallContext } from '../contexts/CallProvider';
import { useRouteNavigate } from '../hooks/routingHooks';
import { ExpandableButton, ExpandableButtonProps, ShapedButtonProps, ToggleIconButton } from './Button';
import {
  CallEndIcon,
  ChatBubbleIcon,
  ExtensionIcon,
  FileIcon,
  FullScreenIcon,
  GroupAddIcon,
  MicroIcon,
  MicroOffIcon,
  MoreVerticalIcon,
  PlaceAudioCallIcon,
  RecordingIcon,
  RoundCloseIcon,
  ScreenShareArrowIcon,
  ScreenShareRegularIcon,
  ScreenShareScreenAreaIcon,
  VideoCameraIcon,
  VideoCameraOffIcon,
  VolumeIcon,
  WindowIcon,
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
  };
});

export const CallingChatButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="chat" Icon={ChatBubbleIcon} {...props} />;
};

export const CallingEndButton = (props: ExpandableButtonProps) => {
  const navigate = useRouteNavigate();
  return (
    <ColoredCallButton
      paletteColor={(theme) => theme.palette.error}
      onClick={() => {
        // TODO: Send event to end call
        navigate('/');
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
  return <CallButton aria-label="full screen" Icon={FullScreenIcon} {...props} />;
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
  const { t } = useTranslation();
  return (
    <CallButton
      aria-label="screen share"
      Icon={ScreenShareArrowIcon}
      expandMenuOptions={[
        {
          description: t('share_screen'),
          icon: <ScreenShareRegularIcon />,
        },
        {
          description: t('share_window'),
          icon: <WindowIcon />,
        },
        {
          description: t('share_screen_area'),
          icon: <ScreenShareScreenAreaIcon />,
        },
        {
          description: t('share_file'),
          icon: <FileIcon />,
        },
      ]}
      {...props}
    />
  );
};

const useMediaDeviceExpandMenuOptions = (kind: MediaDeviceKind) => {
  const { mediaDevices } = useContext(CallContext);

  return useMemo(
    () =>
      mediaDevices[kind].map((device) => ({
        key: device.deviceId,
        description: device.label,
      })),
    [mediaDevices, kind]
  );
};

export const CallingVolumeButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('audiooutput');

  return (
    <CallButton
      aria-label="volume options"
      Icon={VolumeIcon}
      expandMenuOptions={[
        {
          options,
        },
      ]}
      {...props}
    />
  );
};

export const CallingMicButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('audioinput');

  return (
    <CallButton
      aria-label="microphone options"
      expandMenuOptions={[
        {
          options,
        },
      ]}
      IconButtonComp={ToggleAudioCameraIconButton}
      {...props}
    />
  );
};

const ToggleAudioCameraIconButton = (props: IconButtonProps) => {
  const { isAudioOn, setAudioStatus } = useContext(CallContext);
  return (
    <ToggleIconButton
      IconOn={MicroIcon}
      IconOff={MicroOffIcon}
      selected={isAudioOn}
      toggle={() => setAudioStatus(!isAudioOn)}
      {...props}
    />
  );
};

export const CallingVideoCameraButton = (props: ExpandableButtonProps) => {
  const options = useMediaDeviceExpandMenuOptions('videoinput');

  return (
    <CallButton
      aria-label="camera options"
      expandMenuOptions={[
        {
          options,
        },
      ]}
      IconButtonComp={ToggleVideoCameraIconButton}
      {...props}
    />
  );
};

const ToggleVideoCameraIconButton = (props: IconButtonProps) => {
  const { isVideoOn, setVideoStatus } = useContext(CallContext);
  return (
    <ToggleIconButton
      IconOn={VideoCameraIcon}
      IconOff={VideoCameraOffIcon}
      selected={isVideoOn}
      toggle={() => setVideoStatus(!isVideoOn)}
      {...props}
    />
  );
};

// Calling pending/receiving interface
export const CallingCancelButton = (props: IconButtonProps) => {
  const navigate = useRouteNavigate();

  return (
    <ColoredCallButton
      aria-label="cancel call"
      onClick={() => {
        navigate(-1);
      }}
      Icon={CallEndIcon}
      paletteColor={(theme) => theme.palette.error}
      {...props}
    />
  );
};

export const CallingAnswerAudioButton = (props: IconButtonProps) => {
  const { acceptCall } = useContext(CallContext);

  return (
    <ColoredCallButton
      aria-label="answer call audio"
      onClick={() => {
        acceptCall();
      }}
      Icon={PlaceAudioCallIcon}
      paletteColor={(theme) => theme.palette.success}
      {...props}
    />
  );
};

export const CallingAnswerVideoButton = (props: IconButtonProps) => {
  const { acceptCall } = useContext(CallContext);

  return (
    <ColoredCallButton
      aria-label="answer call video"
      onClick={() => {
        acceptCall();
      }}
      paletteColor={(theme) => theme.palette.success}
      Icon={VideoCameraIcon}
      {...props}
    />
  );
};

export const CallingRefuseButton = (props: IconButtonProps) => {
  const navigate = useRouteNavigate();
  return (
    <ColoredCallButton
      aria-label="refuse call"
      onClick={() => {
        navigate(-1);
      }}
      paletteColor={(theme) => theme.palette.error}
      Icon={RoundCloseIcon}
      {...props}
    />
  );
};
