import { Stack, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"
import { InfoButton, ToggleVisibilityButton } from "./buttons"
import { CheckedIcon, RoundCrossIcon, LockIcon, PenIcon, PersonIcon } from "./svgIcons"

const iconsHeight = "16px"
const StyledCheckedIconSuccess = styled(CheckedIcon)(({theme}) => ({height: iconsHeight, color: theme.palette.success.main}))
const StyledRoundCrossIconError = styled(RoundCrossIcon)(({theme}) => ({height: iconsHeight, color: theme.palette.error.main}))
const StyledPenIconLight = styled(PenIcon)({height: iconsHeight, color: "#03B9E9"})
const StyledPenIconDark  = styled(PenIcon)(({theme}) => ({height: iconsHeight, color: theme.palette.primary.dark}))
const StyledPersonIconLight = styled(PersonIcon)({height: iconsHeight, color: "#03B9E9"})
const StyledLockIcon = styled(LockIcon)({height: iconsHeight, color: "#03B9E9"})

export const UsernameInput = ({infoButtonProps, ...props}) => {
    const [isSelected, setIsSelected] = React.useState(false);
    const [input, setInput] = React.useState(props.defaultValue);
    const [startAdornment, setStartAdornment] = React.useState()

    const onChange = React.useCallback((event) => {
        setInput(event.target.value)
        props.onChange?.(event)
    }, [props.onChange])

    React.useEffect(() => {
        /* Handle startAdornment */
        let Icon = StyledPersonIconLight
        let visibility = "visible"
        if (props.error) {
            Icon = StyledRoundCrossIconError
        }
        else if (props.success) {
            Icon = StyledCheckedIconSuccess
        }
        else if (!isSelected && !input) {
            visibility = "hidden" // keep icon's space so text does not move
        }
        setStartAdornment(<Icon sx={{visibility}}/>)
    }, [props.error, props.success, isSelected, input])

    return (
        <TextField
            {...props}
            label="Choose an identifier"
            variant="standard"
            InputLabelProps={{ shrink: !!(isSelected || input) }}
            onChange={onChange}
            InputProps={{
                startAdornment,
                endAdornment: <InfoButton {...infoButtonProps}/>,
            }}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
        />
    )
}

export const PasswordInput = ({infoButtonProps, ...props}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSelected, setIsSelected] = React.useState(false);
    const [input, setInput] = React.useState(props.defaultValue);
    const [startAdornment, setStartAdornment] = React.useState()

    const toggleShowPassword = () => {
        setShowPassword((showPassword) => !showPassword);
    }

    const onChange = React.useCallback((event) => {
        setInput(event.target.value)
        props.onChange?.(event)
    }, [props.onChange])

    React.useEffect(() => {
        /* Handle startAdornment */
        let Icon = StyledLockIcon
        let visibility = "visible"
        if (props.error) {
            Icon = StyledRoundCrossIconError
        }
        else if (props.success) {
            Icon = StyledCheckedIconSuccess
        }
        else if (!isSelected && !input) {
            visibility = "hidden" // keep icon's space so text does not move
        }
        setStartAdornment(<Icon sx={{visibility}}/>)
    }, [props.error, props.success, isSelected, input])

    return (
        <TextField
            {...props}
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="standard"
            autoComplete="current-password"
            InputLabelProps={{ shrink: !!(isSelected || input) }}
            onChange={onChange}
            InputProps={{
                startAdornment,
                endAdornment: <Stack direction="row" spacing="14px">
                    <InfoButton {...infoButtonProps}/>
                    <ToggleVisibilityButton
                        visible={showPassword}
                        onClick={toggleShowPassword}
                    />
                </Stack>,
            }}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
        />
    )
}

export const NickNameInput = (props) => {
    const [isSelected, setIsSelected] = React.useState(false);
    const [input, setInput] = React.useState(props.defaultValue);
    const [startAdornmentVisibility, setStartAdornmentVisibility] = React.useState()

    const onChange = React.useCallback((event) => {
        setInput(event.target.value)
        props.onChange?.(event)
    }, [props.onChange])

    React.useEffect(() => {
        setStartAdornmentVisibility((isSelected || input) ? "visible" : "hidden")
    }, [isSelected, input])

    return (
        <TextField
            {...props}
            label="Nickname, surname..."
            variant="standard"
            InputLabelProps={{ shrink: !!(isSelected || input) }}
            onChange={onChange}
            InputProps={{
                startAdornment: <StyledPenIconLight sx={{visibility: startAdornmentVisibility}}/>,
            }}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
        />
    )
}

export const RegularInput = (props) => {
    const [isSelected, setIsSelected] = React.useState(false);
    const [input, setInput] = React.useState(props.defaultValue);
    const [startAdornmentVisibility, setStartAdornmentVisibility] = React.useState()
    const [endAdornmentVisibility, setEndAdornmentVisibility] = React.useState()

    const onChange = React.useCallback((event) => {
        setInput(event.target.value)
        props.onChange?.(event)
    }, [props.onChange])

    React.useEffect(() => {
        setStartAdornmentVisibility((isSelected || input) ? "visible" : "hidden")
        setEndAdornmentVisibility((isSelected || input) ? "hidden" : "visible")
    }, [isSelected, input])

    return (
        <TextField
            {...props}
            variant="standard"
            InputLabelProps={{ shrink: !!(isSelected || input) }}
            onChange={onChange}
            InputProps={{
                startAdornment: <StyledPenIconLight sx={{visibility: startAdornmentVisibility}}/>,
                endAdornment: <StyledPenIconDark sx={{visibility: endAdornmentVisibility}}/>,
            }}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
        />
    )
}
