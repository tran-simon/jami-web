import { QuestionMark } from "@mui/icons-material";
import { Box, ClickAwayListener, IconButton, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";
import EmojiPicker from "emoji-picker-react";
import React, { useState, useCallback } from "react";
import { Arrow2Icon, Arrow3Icon, ArrowIcon, CameraIcon, CameraInBubbleIcon, CancelIcon, CrossedEyeIcon, CrossIcon, EmojiIcon, EyeIcon, FolderIcon, InfoIcon, MicroInBubbleIcon, PaperClipIcon, PenIcon, SaltireIcon } from "./svgIcons";

const RoundButton = styled(
    ({Icon, ...props}) => (
        <IconButton {...props} disableRipple={true}>
            <Icon fontSize="inherit"/>
        </IconButton>
    )
)(({theme}) => ({
    border: `1px solid ${theme.palette.primary.dark}`,
    color: theme.palette.primary.dark,
    fontSize: "15px",
    "&:hover": {
        background: theme.palette.primary.light,
    },
    "&:active": {
        color: "#FFF",
        background: theme.palette.primary.dark,
    },
    "&.MuiIconButton-sizeSmall": {
        height: "15px",
        width: "15px",
    },
    "&.MuiIconButton-sizeMedium": {
        height: "30px",
        width: "30px",
    },
    "&.MuiIconButton-sizeLarge": {
        height: "53px",
        width: "53px",
    }
}));

export const CancelPictureButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="remove picture"
            Icon={CancelIcon}
            size="large"
        />
    )
}

export const EditPictureButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="edit picture"
            Icon={PenIcon}
            size="large"
        />
    )
}

export const UploadPictureButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="upload picture"
            Icon={FolderIcon}
            size="large"
        />
    )
}

export const TakePictureButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="take picture"
            Icon={CameraIcon}
            size="large"
        />
    )
}

export const InfoButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="informations"
            Icon={InfoIcon}
            size="small"
        />
    )
}

export const TipButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="tip"
            Icon={QuestionMark}
            size="medium"
        />
    )
}

export const MoreButton = styled(
    (props) => {
        return (
            <IconButton
                {...props}
                disableRipple={true}
                aria-label="more"
            >
                <CrossIcon fontSize="inherit"/>
            </IconButton>
        )
    }
)(({theme}) => ({
    border: `1px solid ${theme.palette.primary.dark}`,
    color: theme.palette.primary.dark,
    fontSize: "10px",
    height: "20px",
    width: "20px",
    "&:hover": {
        background: theme.palette.primary.light,
    },
    "&:active": {
        color: "#FFF",
        background: theme.palette.primary.dark,
    },
}))

export const BackButton = styled(
    (props) => {
        return (
            <IconButton
                {...props}
                disableRipple={true}
                aria-label="back"
            >
                <ArrowIcon fontSize="inherit"/>
            </IconButton>
        )
    }
)(({theme}) => ({
    color: theme.palette.primary.dark,
    fontSize: "15px",
    height: "30px",
    width: "51px",
    borderRadius: "5px",
    "&:hover": {
        background: theme.palette.primary.light,
    },
}))

export const CloseButton = styled(
    (props) => {
        return (
            <IconButton
                {...props}
                disableRipple={true}
                aria-label="close"
            >
                <SaltireIcon fontSize="inherit"/>
            </IconButton>
        )
    }
)(({theme}) => ({
    color: theme.palette.primary.dark,
    fontSize: "15px",
    height: "30px",
    width: "30px",
    borderRadius: "5px",
    "&:hover": {
        background: theme.palette.primary.light,
    },
}))

export const ToggleVisibilityButton = styled(
    ({visible, ...props}) => {
        const Icon = visible ? CrossedEyeIcon : EyeIcon
        return (
            <IconButton {...props} disableRipple={true}>
                <Icon fontSize="inherit"/>
            </IconButton>
        )
    }
)(({theme}) => ({
    color: theme.palette.primary.dark,
    fontSize: "15px",
    height: "15px",
    width: "15px",
    "&:hover": {
        background: theme.palette.primary.light,
    },
}))

const SquareButton = styled(
    ({Icon, ...props}) => (
        <IconButton {...props} disableRipple={true}>
            <Icon fontSize="inherit"/>
        </IconButton>
    )
)(({theme}) => ({
    color: "#7E7E7E",
    fontSize: "25px",
    height: "36px",
    width: "36px",
    borderRadius: "5px",
    "&:hover": {
        background: "#E5E5E5",
    },
}));

export const RecordVideoMessageButton = (props) => {
    return (
        <SquareButton {...props}
            aria-label="record video message"
            Icon={CameraInBubbleIcon}
        />
    )
}

export const RecordVoiceMessageButton = (props) => {
    return (
        <SquareButton {...props}
            aria-label="record voice message"
            Icon={MicroInBubbleIcon}
        />
    )
}

export const UploadFileButton = (props) => {
    return (
        <SquareButton {...props}
            aria-label="upload file"
            Icon={PaperClipIcon}
        />
    )
}

export const SendMessageButton = (props) => {
    return (
        <SquareButton {...props}
            aria-label="send message"
            Icon={Arrow2Icon}
        />
    )
}

export const ReplyMessageButton = styled(
    ({Icon, ...props}) => (
        <IconButton
            {...props}
            disableRipple={true}
            aria-label="send message"
        >
            <Arrow3Icon fontSize="inherit"/>
        </IconButton>
    )
)(({theme}) => ({
    color: theme.palette.primary.dark,
    fontSize: "20px",
    height: "20px",
    width: "20px",
    borderRadius: "5px",
    "&:hover": {
        background: "#E5E5E5",
    },
}));

export const EmojiButton = styled(
    ({emoji, ...props}) => (
        <IconButton {...props} disableRipple={true}>
            {emoji}
        </IconButton>
    )
)(({theme}) => ({
    color: "white",
    fontSize: "20px",
    height: "20px",
    width: "20px",
}));

export const SelectEmojiButton = (props) => {
    const [anchorEl, setAnchorEl] = useState(null)
  
    const handleOpenEmojiPicker = useCallback(
      e => setAnchorEl(anchorEl ? null : e.currentTarget),
      [anchorEl],
    )
  
    const handleClose = useCallback(
      () => setAnchorEl(null),
      [setAnchorEl],
    )
  
    const onEmojiClick = useCallback(
      (e, emojiObject) => {
        props.onEmojiSelected(emojiObject.emoji)
        handleClose()
      },
      [handleClose, props.onEmojiSelected],
    )
  
    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined
  
    return (
        <ClickAwayListener onClickAway={handleClose}>
            <Box>
                <SquareButton
                    aria-describedby={id}
                    aria-label="select emoji"
                    Icon={EmojiIcon}
                    onClick={handleOpenEmojiPicker}
                />
                <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                >
                    <EmojiPicker.default
                        onEmojiClick={onEmojiClick}
                        disableAutoFocus={true}
                        disableSkinTonePicker={true}
                        native
                    />
                </Popper>
            </Box>
        </ClickAwayListener>
    )
}

