import { QuestionMark } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { styled } from "@mui/styles";
import { ArrowIcon, CameraIcon, CancelIcon, CrossedEyeIcon, CrossIcon, EyeIcon, FolderIcon, InfoIcon, PenIcon } from "./svgIcons";

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

export const CancelButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="remove picture"
            Icon={CancelIcon}
            size="large"
        />
    )
}

export const EditButton = (props) => {
    return (
        <RoundButton {...props}
            aria-label="edit picture"
            Icon={PenIcon}
            size="large"
        />
    )
}

export const UploadButton = (props) => {
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
            aria-label="informations"
            Icon={QuestionMark}
            size="medium"
        />
    )
}

export const BackButton = styled(
    (props) => {
        return (
            <IconButton {...props} disableRipple={true}>
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
            <IconButton {...props} disableRipple={true}>
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
