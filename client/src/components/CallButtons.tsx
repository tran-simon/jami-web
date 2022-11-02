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

import React, { useContext } from 'react';
import { Trans } from 'react-i18next';

import { WebRTCContext } from '../contexts/WebRTCProvider';
import { ExpandableButton, ExpandableButtonProps, ToggleIconButton, ToggleIconButtonProps } from './Button';
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
} from './SvgIcon';

export const CallingChatButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="chat" Icon={ChatBubbleIcon} {...props} />;
};

export const CallingEndButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="call end" Icon={CallEndIcon} sx={{ backgroundColor: 'red' }} {...props} />;
};

export const CallingExtensionButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="extensions" Icon={ExtensionIcon} {...props} />;
};

export const CallingFullScreenButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="full screen" Icon={FullScreenIcon} {...props} />;
};

export const CallingGroupButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="group options" Icon={GroupAddIcon} {...props} />;
};

export const CallingMoreVerticalButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="more vertical" Icon={MoreVerticalIcon} {...props} />;
};

export const CallingRecordButton = (props: ExpandableButtonProps) => {
  return <ExpandableButton aria-label="recording options" Icon={RecordingIcon} {...props} />;
};

export const CallingScreenShareButton = (props: ExpandableButtonProps) => {
  return (
    <ExpandableButton
      aria-label="screen share"
      Icon={ScreenShareArrowIcon}
      expandMenuOptions={[
        {
          description: <Trans i18nKey="share_screen" />,
          icon: <ScreenShareRegularIcon />,
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
    <ExpandableButton
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
export const CallingMicButton = (props: Partial<ToggleIconButtonProps>) => {
  const { isAudioOn, setAudioStatus } = useContext(WebRTCContext);

  return (
    <ToggleIconButton
      aria-label="microphone options"
      sx={{ color: 'white' }}
      IconOn={MicroIcon}
      IconOff={MicroOffIcon}
      selected={isAudioOn}
      toggle={() => setAudioStatus(!isAudioOn)}
      {...props}
    />
  );
};

export const CallingVideoCameraButton = (props: Partial<ToggleIconButtonProps>) => {
  const { isVideoOn, setVideoStatus } = useContext(WebRTCContext);

  return (
    <ToggleIconButton
      aria-label="camera options"
      sx={{ color: 'white' }}
      IconOn={VideoCameraIcon}
      IconOff={VideoCameraOffIcon}
      selected={isVideoOn}
      toggle={() => setVideoStatus(!isVideoOn)}
      {...props}
    />
  );
};
