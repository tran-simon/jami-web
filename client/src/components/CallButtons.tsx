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
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';

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
  RecordingIcon,
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
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  color: 'white',
});

const ColoredCallButton = styled((props: ExpandableButtonProps) => {
  return <ExpandableButton {...props} />;
})({
  color: 'white',
  backgroundColor: '#a30000',
  '&:hover': {
    backgroundColor: '#ff0000',
  },
});

export const CallingChatButton = (props: ExpandableButtonProps) => {
  return <CallButton aria-label="chat" Icon={ChatBubbleIcon} {...props} />;
};

export const CallingEndButton = (props: ExpandableButtonProps) => {
  return <ColoredCallButton sx={{}} aria-label="call end" Icon={CallEndIcon} {...props} />;
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
  return (
    <CallButton
      aria-label="screen share"
      Icon={ScreenShareArrowIcon}
      expandMenuOptions={[
        {
          description: <Trans i18nKey="share_screen" />,
          icon: <ScreenShareRegularIcon />,
        },
        {
          description: <Trans i18nKey="share_window" />,
          icon: <WindowIcon />,
        },
        {
          description: <Trans i18nKey="share_screen_area" />,
          icon: <ScreenShareScreenAreaIcon />,
        },
        {
          description: <Trans i18nKey="share_file" />,
          icon: <FileIcon />,
        },
      ]}
      {...props}
    />
  );
};

export const CallingVolumeButton = (props: ExpandableButtonProps) => {
  return (
    <CallButton
      aria-label="volume options"
      Icon={VolumeIcon}
      expandMenuOptions={[
        {
          options: [
            {
              key: '0',
              description: <Trans i18nKey="dummy_option_string" />,
            },
          ],
        },
      ]}
      {...props}
    />
  );
};

export const CallingMicButton = (props: ExpandableButtonProps) => {
  const { isAudioOn, setAudioStatus } = useContext(WebRTCContext);

  return (
    <CallButton
      aria-label="microphone options"
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

  return (
    <CallButton
      aria-label="camera options"
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
