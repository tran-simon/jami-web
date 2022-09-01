import { QuestionMark } from "@mui/icons-material";
import { Box, IconButton, Popper } from "@mui/material";
import { blue } from "@mui/material/colors";
import { styled } from "@mui/styles";
import EmojiPicker from "emoji-picker-react";
import React from "react";
import { Arrow2Icon, ArrowIcon, CameraIcon, CameraInBubbleIcon, CancelIcon, CrossedEyeIcon, CrossIcon, EmojiIcon, EyeIcon, FolderIcon, InfoIcon, MicroInBubbleIcon, PaperClipIcon, PenIcon } from "./svgIcons";

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
                <CrossIcon fontSize="inherit"/>
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

export const SelectEmojiButton = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null)
  
    const handleOpenEmojiPicker = React.useCallback(
      e => setAnchorEl(anchorEl ? null : e.currentTarget),
      [anchorEl],
    )
  
    const handleClose = React.useCallback(
      () => setAnchorEl(null),
      [setAnchorEl],
    )
  
    const onEmojiClick = React.useCallback(
      (e, emojiObject) => {
        props.onEmojiSelected(emojiObject.emoji)
        handleClose()
      },
      [handleClose, props.onEmojiSelected],
    )
  
    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined
  
    return (
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
    )
  }
