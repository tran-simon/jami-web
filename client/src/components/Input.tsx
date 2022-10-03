import { IconButtonProps, Stack, TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from 'react';

import { InfoButton, ToggleVisibilityButton } from './Button';
import { CheckedIcon, LockIcon, PenIcon, PersonIcon, RoundSaltireIcon } from './SvgIcon';

const iconsHeight = '16px';
const StyledCheckedIconSuccess = styled(CheckedIcon)(({ theme }) => ({
  height: iconsHeight,
  color: theme.palette.success.main,
}));
const StyledRoundSaltireIconError = styled(RoundSaltireIcon)(({ theme }) => ({
  height: iconsHeight,
  color: theme.palette.error.main,
}));
const StyledPenIconLight = styled(PenIcon)({ height: iconsHeight, color: '#03B9E9' });
const StyledPenIconDark = styled(PenIcon)(({ theme }) => ({ height: iconsHeight, color: theme.palette.primary.dark }));
const StyledPersonIconLight = styled(PersonIcon)({ height: iconsHeight, color: '#03B9E9' });
const StyledLockIcon = styled(LockIcon)({ height: iconsHeight, color: '#03B9E9' });

type InputProps = TextFieldProps & {
  infoButtonProps?: IconButtonProps;
  success?: boolean;
};

export const UsernameInput = ({ infoButtonProps, onChange: _onChange, ...props }: InputProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
      _onChange?.(event);
    },
    [_onChange]
  );

  useEffect(() => {
    /* Handle startAdornment */
    let Icon = StyledPersonIconLight;
    let visibility = 'visible';
    if (props.error) {
      Icon = StyledRoundSaltireIconError;
    } else if (props.success) {
      Icon = StyledCheckedIconSuccess;
    } else if (!isSelected && !input) {
      visibility = 'hidden'; // keep icon's space so text does not move
    }
    setStartAdornment(<Icon sx={{ visibility }} />);
  }, [props.error, props.success, isSelected, input]);

  return (
    <TextField
      {...props}
      label="Choose an identifier"
      variant="standard"
      InputLabelProps={{ shrink: !!(isSelected || input) }}
      onChange={onChange}
      InputProps={{
        startAdornment,
        endAdornment: <InfoButton {...infoButtonProps} />,
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    />
  );
};

export const PasswordInput = ({ infoButtonProps, onChange: _onChange, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();

  const toggleShowPassword = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
      _onChange?.(event);
    },
    [_onChange]
  );

  useEffect(() => {
    /* Handle startAdornment */
    let Icon = StyledLockIcon;
    let visibility = 'visible';
    if (props.error) {
      Icon = StyledRoundSaltireIconError;
    } else if (props.success) {
      Icon = StyledCheckedIconSuccess;
    } else if (!isSelected && !input) {
      visibility = 'hidden'; // keep icon's space so text does not move
    }
    setStartAdornment(<Icon sx={{ visibility }} />);
  }, [props.error, props.success, isSelected, input]);

  return (
    <TextField
      {...props}
      label="Password"
      type={showPassword ? 'text' : 'password'}
      variant="standard"
      autoComplete="current-password"
      InputLabelProps={{ shrink: !!(isSelected || input) }}
      onChange={onChange}
      InputProps={{
        startAdornment,
        endAdornment: (
          <Stack direction="row" spacing="14px">
            <InfoButton {...infoButtonProps} />
            <ToggleVisibilityButton visible={showPassword} onClick={toggleShowPassword} />
          </Stack>
        ),
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    />
  );
};

export const NickNameInput = ({ onChange: _onChange, ...props }: TextFieldProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornmentVisibility, setStartAdornmentVisibility] = useState<'visible' | 'hidden'>('hidden');

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
      _onChange?.(event);
    },
    [_onChange]
  );

  useEffect(() => {
    setStartAdornmentVisibility(isSelected || input ? 'visible' : 'hidden');
  }, [isSelected, input]);

  return (
    <TextField
      {...props}
      label="Nickname, surname..."
      variant="standard"
      InputLabelProps={{ shrink: !!(isSelected || input) }}
      onChange={onChange}
      InputProps={{
        startAdornment: <StyledPenIconLight sx={{ visibility: startAdornmentVisibility }} />,
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    />
  );
};

export const RegularInput = ({ onChange: _onChange, ...props }: TextFieldProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornmentVisibility, setStartAdornmentVisibility] = useState<'visible' | 'hidden'>('hidden');
  const [endAdornmentVisibility, setEndAdornmentVisibility] = useState<'visible' | 'hidden'>('visible');

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
      _onChange?.(event);
    },
    [_onChange]
  );

  useEffect(() => {
    setStartAdornmentVisibility(isSelected || input ? 'visible' : 'hidden');
    setEndAdornmentVisibility(isSelected || input ? 'hidden' : 'visible');
  }, [isSelected, input]);

  return (
    <TextField
      {...props}
      variant="standard"
      InputLabelProps={{ shrink: !!(isSelected || input) }}
      onChange={onChange}
      InputProps={{
        startAdornment: <StyledPenIconLight sx={{ visibility: startAdornmentVisibility }} />,
        endAdornment: <StyledPenIconDark sx={{ visibility: endAdornmentVisibility }} />,
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    />
  );
};
