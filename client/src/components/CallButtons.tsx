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
import { IconButton, IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useContext } from 'react';

import { WebRTCContext } from '../contexts/WebRTCProvider';
import { ToggleIconButton, ToggleIconButtonProps } from './Button';
import {
  CallEndIcon,
  ChatBubbleIcon,
  ExtensionIcon,
  FullscreenIcon,
  GroupAddIcon,
  MicroIcon,
  MicroOffIcon,
  RecordingIcon,
  ScreenShareIcon,
  VideoCameraIcon,
  VideoCameraOffIcon,
  VolumeIcon,
} from './SvgIcon';

export const CallingChatButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="chat" sx={{ color: 'white' }}>
      <ChatBubbleIcon />
    </IconButton>
  );
};
export const CallingEndButton = styled((props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="end call">
      <CallEndIcon />
    </IconButton>
  );
})(() => ({
  color: 'white',
  backgroundColor: 'red',
  '&:hover': {
    backgroundColor: 'darkred',
  },
}));
export const CallingExtensionButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="extensions" sx={{ color: 'white' }}>
      <ExtensionIcon />
    </IconButton>
  );
};
export const CallingFullscreenButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="fullscreen" sx={{ color: 'white' }}>
      <FullscreenIcon />
    </IconButton>
  );
};
export const CallingGroupButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="group options" sx={{ color: 'white' }}>
      <GroupAddIcon />
    </IconButton>
  );
};
export const CallingRecordButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="recording options" sx={{ color: 'white' }}>
      <RecordingIcon />
    </IconButton>
  );
};
export const CallingScreenShareButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="screen share" sx={{ color: 'white' }}>
      <ScreenShareIcon />
    </IconButton>
  );
};
export const CallingVolumeButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="volume options" sx={{ color: 'white' }}>
      <VolumeIcon />
    </IconButton>
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
