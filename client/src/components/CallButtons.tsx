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

import { styled } from '@mui/material/styles';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { WebRTCContext } from '../contexts/WebRTCProvider';
import { ExpandableButton, ExpandableButtonProps, ToggleIconButton } from './Button';
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

type ColoredCallButtonColor = 'red' | 'green';

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
    buttonColor,
    ...props
  }: ExpandableButtonProps & {
    buttonColor: ColoredCallButtonColor;
  }) => {
    return <ExpandableButton {...props} />;
  }
)(({ buttonColor }) => {
  return {
    color: 'white',
    backgroundColor: buttonColor === 'green' ? '#183722' : '#5E070D',
    '&:hover': {
      backgroundColor: buttonColor === 'green' ? '#0B8271' : '#CC0022',
    },
  };
});

export const CallingChatButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="chat" Icon={ChatBubbleIcon} {...props} />;
};

export const CallingEndButton = (props: ExpandableButtonProps) => {
  return <ColoredCallButton buttonColor="red" aria-label="call end" Icon={CallEndIcon} {...props} />;
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
  const { mediaDevices } = useContext(WebRTCContext);

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
  const { isAudioOn, setAudioStatus } = useContext(WebRTCContext);
  const options = useMediaDeviceExpandMenuOptions('audioinput');

  return (
    <CallButton
      aria-label="microphone options"
      expandMenuOptions={[
        {
          options,
        },
      ]}
      IconButtonComp={(props) => (
        <ToggleIconButton
          IconOn={MicroIcon}
          IconOff={MicroOffIcon}
          selected={isAudioOn}
          toggle={() => setAudioStatus(!isAudioOn)}
          {...props}
        />
      )}
      {...props}
    />
  );
};

export const CallingVideoCameraButton = (props: ExpandableButtonProps) => {
  const { isVideoOn, setVideoStatus } = useContext(WebRTCContext);
  const options = useMediaDeviceExpandMenuOptions('videoinput');

  return (
    <CallButton
      aria-label="camera options"
      expandMenuOptions={[
        {
          options,
        },
      ]}
      IconButtonComp={(props) => (
        <ToggleIconButton
          IconOn={VideoCameraIcon}
          IconOff={VideoCameraOffIcon}
          selected={isVideoOn}
          toggle={() => setVideoStatus(!isVideoOn)}
          {...props}
        />
      )}
      {...props}
    />
  );
};

// Calling pending/receiving interface
export const CallingAnswerAudioButton = (props: ExpandableButtonProps) => {
  return <ColoredCallButton aria-label="answer audio" buttonColor="green" Icon={PlaceAudioCallIcon} {...props} />;
};

export const CallingAnswerVideoButton = (props: ExpandableButtonProps) => {
  return <ColoredCallButton aria-label="answer video" buttonColor="green" Icon={VideoCameraIcon} {...props} />;
};

export const CallingRefuseButton = (props: ExpandableButtonProps) => {
  return <ColoredCallButton aria-label="reject" buttonColor="red" Icon={RoundCloseIcon} {...props} />;
};
