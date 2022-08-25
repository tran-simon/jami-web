import { IconButton } from "@mui/material";
import { styled } from "@mui/styles";
import { CameraIcon, CancelIcon, FolderIcon, PenIcon } from "./svgIcons";

const CustomisePictureButton = styled(
    ({Icon, ...props}) => (
        <IconButton {...props} disableRipple={true}>
            <Icon fontSize="inherit"/>
        </IconButton>
    )
)(() => ({
    border: "1px solid #005699",
    color: "#005699",
    height: "53px",
    width: "53px",
    fontSize: "15px",
    "&:hover": {
        background: "#0056991A",
    },
    "&:active": {
        color: "#FFF",
        background: "#005699",
    },
}));

export const RemovePictureButton = (props) => {
    return (
        <CustomisePictureButton {...props}
            aria-label="remove picture"
            Icon={CancelIcon}
        />
    )
}

export const EditPictureButton = (props) => {
    return (
        <CustomisePictureButton {...props}
            aria-label="edit picture"
            Icon={PenIcon}
        />
    )
}

export const UploadPictureButton = (props) => {
    return (
        <CustomisePictureButton {...props}
            aria-label="upload picture"
            Icon={FolderIcon}
        />
    )
}

export const TakePictureButton = (props) => {
    return (
        <CustomisePictureButton {...props}
            aria-label="take picture"
            Icon={CameraIcon}
        />
    )
}
