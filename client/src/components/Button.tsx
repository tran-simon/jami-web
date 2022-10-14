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
import { QuestionMark } from '@mui/icons-material';
import { Box, ClickAwayListener, IconButton, IconButtonProps, Popper, SvgIconProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiPicker, { IEmojiData } from 'emoji-picker-react';
import { ComponentType, MouseEvent, useCallback, useState } from 'react';

import {
  Arrow2Icon,
  Arrow3Icon,
  ArrowIcon,
  AudioCallIcon,
  CallEndIcon,
  CameraIcon,
  CameraInBubbleIcon,
  CancelIcon,
  ChatBubbleIcon,
  CrossedEyeIcon,
  CrossIcon,
  EmojiIcon,
  ExtensionIcon,
  EyeIcon,
  FolderIcon,
  FullscreenIcon,
  GroupAddIcon,
  InfoIcon,
  ListIcon,
  MicroIcon,
  MicroInBubbleIcon,
  PaperClipIcon,
  PenIcon,
  PeopleWithPlusSignIcon,
  RecordingIcon,
  SaltireIcon,
  ScreenShareIcon,
  VideoCallIcon,
  VideoCameraIcon,
  VolumeIcon,
} from './SvgIcon';
import CustomTooltip from './Tooltip';

type ShapedButtonProps = IconButtonProps & {
  Icon: ComponentType<SvgIconProps>;
};

const RoundButton = styled(({ Icon, ...props }: ShapedButtonProps) => (
  <IconButton {...props} disableRipple={true}>
    <Icon fontSize="inherit" />
  </IconButton>
))(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.dark}`,
  color: theme.palette.primary.dark,
  fontSize: '15px',
  '&:hover': {
    background: theme.palette.primary.light,
  },
  '&:active': {
    color: '#FFF',
    background: theme.palette.primary.dark,
  },
  '&.MuiIconButton-sizeSmall': {
    height: '15px',
    width: '15px',
  },
  '&.MuiIconButton-sizeMedium': {
    height: '30px',
    width: '30px',
  },
  '&.MuiIconButton-sizeLarge': {
    height: '53px',
    width: '53px',
  },
}));

export const CancelPictureButton = (props: IconButtonProps) => {
  return <RoundButton {...props} aria-label="remove picture" Icon={CancelIcon} size="large" />;
};

export const EditPictureButton = (props: IconButtonProps) => {
  return <RoundButton {...props} aria-label="edit picture" Icon={PenIcon} size="large" />;
};

export const UploadPictureButton = (props: IconButtonProps) => {
  return <RoundButton {...props} aria-label="upload picture" Icon={FolderIcon} size="large" />;
};

export const TakePictureButton = (props: IconButtonProps) => {
  return <RoundButton {...props} aria-label="take picture" Icon={CameraIcon} size="large" />;
};

type InfoButtonProps = IconButtonProps & {
  tooltipTitle: string;
};
export const InfoButton = ({ tooltipTitle, ...props }: InfoButtonProps) => {
  return (
    <CustomTooltip className="tooltip" title={tooltipTitle}>
      <RoundButton {...props} aria-label="informations" Icon={InfoIcon} size="small" />
    </CustomTooltip>
  );
};

export const TipButton = (props: IconButtonProps) => {
  return <RoundButton {...props} aria-label="tip" Icon={QuestionMark} size="medium" />;
};

export const MoreButton = styled((props: IconButtonProps) => {
  return (
    <IconButton {...props} disableRipple={true} aria-label="more">
      <CrossIcon fontSize="inherit" />
    </IconButton>
  );
})(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.dark}`,
  color: theme.palette.primary.dark,
  fontSize: '10px',
  height: '20px',
  width: '20px',
  '&:hover': {
    background: theme.palette.primary.light,
  },
  '&:active': {
    color: '#FFF',
    background: theme.palette.primary.dark,
  },
}));

export const BackButton = styled((props: IconButtonProps) => {
  return (
    <IconButton {...props} disableRipple={true} aria-label="back">
      <ArrowIcon fontSize="inherit" />
    </IconButton>
  );
})(({ theme }) => ({
  color: theme.palette.primary.dark,
  fontSize: '15px',
  height: '30px',
  width: '51px',
  borderRadius: '5px',
  '&:hover': {
    background: theme.palette.primary.light,
  },
}));

export const CallingChatButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="chat" sx={{ color: 'white' }}>
      <ChatBubbleIcon />
    </IconButton>
  );
};

export const CallingEndButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="end call" sx={{ color: 'white', backgroundColor: 'red' }}>
      <CallEndIcon />
    </IconButton>
  );
};

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

export const CallingMicButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="microphone options" sx={{ color: 'white' }}>
      <MicroIcon />
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

export const CallingVideoCameraButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props} aria-label="camera options" sx={{ color: 'white' }}>
      <VideoCameraIcon />
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

export const CloseButton = styled((props: IconButtonProps) => {
  return (
    <IconButton {...props} disableRipple={true} aria-label="close">
      <SaltireIcon fontSize="inherit" />
    </IconButton>
  );
})(({ theme }) => ({
  color: theme.palette.primary.dark,
  fontSize: '15px',
  height: '30px',
  width: '30px',
  borderRadius: '5px',
  '&:hover': {
    background: theme.palette.primary.light,
  },
}));

type ToggleVisibilityButtonProps = IconButtonProps & {
  visible: boolean;
};
export const ToggleVisibilityButton = styled(({ visible, ...props }: ToggleVisibilityButtonProps) => {
  const Icon = visible ? CrossedEyeIcon : EyeIcon;
  return (
    <IconButton {...props} disableRipple={true}>
      <Icon fontSize="inherit" />
    </IconButton>
  );
})(({ theme }) => ({
  color: theme.palette.primary.dark,
  fontSize: '15px',
  height: '15px',
  width: '15px',
  '&:hover': {
    background: theme.palette.primary.light,
  },
}));

const SquareButton = styled(({ Icon, ...props }: ShapedButtonProps) => (
  <IconButton {...props} disableRipple={true}>
    <Icon fontSize="inherit" />
  </IconButton>
))(({ theme }) => ({
  color: '#7E7E7E',
  fontSize: '25px',
  height: '36px',
  width: '36px',
  borderRadius: '5px',
  '&:hover': {
    background: '#E5E5E5',
  },
}));

export const AddParticipantButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="add participant" Icon={PeopleWithPlusSignIcon} />;
};

export const RecordVideoMessageButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="record video message" Icon={CameraInBubbleIcon} />;
};

export const RecordVoiceMessageButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="record voice message" Icon={MicroInBubbleIcon} />;
};

export const ShowOptionsMenuButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="show options menu" Icon={ListIcon} />;
};

export const StartVideoCallButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="start audio call" Icon={AudioCallIcon} />;
};

export const StartAudioCallButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="start video call" Icon={VideoCallIcon} />;
};

export const UploadFileButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="upload file" Icon={PaperClipIcon} />;
};

export const SendMessageButton = (props: IconButtonProps) => {
  return <SquareButton {...props} aria-label="send message" Icon={Arrow2Icon} />;
};

export const ReplyMessageButton = styled((props: IconButtonProps) => (
  <IconButton {...props} disableRipple={true} aria-label="send message">
    <Arrow3Icon fontSize="inherit" />
  </IconButton>
))(({ theme }) => ({
  color: theme.palette.primary.dark,
  fontSize: '20px',
  height: '20px',
  width: '20px',
  borderRadius: '5px',
  '&:hover': {
    background: '#E5E5E5',
  },
}));

type EmojiButtonProps = IconButtonProps & {
  emoji: string;
};
export const EmojiButton = styled(({ emoji, ...props }: EmojiButtonProps) => (
  <IconButton {...props} disableRipple={true}>
    {emoji}
  </IconButton>
))(({ theme }) => ({
  color: 'white',
  fontSize: '20px',
  height: '20px',
  width: '20px',
}));

type SelectEmojiButtonProps = {
  onEmojiSelected: (emoji: string) => void;
};
export const SelectEmojiButton = ({ onEmojiSelected, ...props }: SelectEmojiButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenEmojiPicker = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(anchorEl ? null : e.currentTarget),
    [anchorEl]
  );

  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl]);

  const onEmojiClick = useCallback(
    (e: MouseEvent, emojiObject: IEmojiData) => {
      onEmojiSelected(emojiObject.emoji);
      handleClose();
    },
    [handleClose, onEmojiSelected]
  );

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
        <SquareButton
          aria-describedby={id}
          aria-label="select emoji"
          Icon={EmojiIcon}
          onClick={handleOpenEmojiPicker}
        />
        <Popper id={id} open={open} anchorEl={anchorEl}>
          <EmojiPicker onEmojiClick={onEmojiClick} disableAutoFocus={true} disableSkinTonePicker={true} native />
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};
