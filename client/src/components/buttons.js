import { IconButton } from "@mui/material";
import { CameraIcon, CancelIcon, FolderIcon, PenIcon } from "./svgIcons";

const CustomisePictureButton = ({Icon, ...props}) => {
    return (
        <IconButton
            {...props}
            disableRipple={true}
            sx={{
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
            }}
        >
            <Icon fontSize="inherit"/>
        </IconButton>
    )
}

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
