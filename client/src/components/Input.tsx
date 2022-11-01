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
import { GppMaybe, Warning } from '@mui/icons-material';
import {
  IconButtonProps,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from 'react';

import { InfoButton, ToggleVisibilityButton } from './Button';
import RulesDialog from './RulesDialog';
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

export type InputProps = TextFieldProps & {
  infoButtonProps?: IconButtonProps;
  success?: boolean;
  tooltipTitle: string;
};

export const UsernameInput = ({ infoButtonProps, onChange: _onChange, tooltipTitle, ...props }: InputProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();
  const [isDialogOpened, setIsDialogOpened] = useState<boolean>(false);

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
    <>
      <RulesDialog openDialog={isDialogOpened} title="Username rules :" closeDialog={() => setIsDialogOpened(false)}>
        <UsernameRules />
      </RulesDialog>
      <TextField
        {...props}
        color={inputColor(props.error, props.success)}
        label={'Choose an identifier'}
        variant="standard"
        InputLabelProps={{ shrink: !!(isSelected || input) }}
        onChange={onChange}
        InputProps={{
          startAdornment,
          endAdornment: (
            <InfoButton tooltipTitle={tooltipTitle} {...infoButtonProps} onClick={() => setIsDialogOpened(true)} />
          ),
        }}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
      />
    </>
  );
};

export const PasswordInput = ({ infoButtonProps, onChange: _onChange, tooltipTitle, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();
  const [isDialogOpened, setIsDialogOpened] = useState<boolean>(false);

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
    <>
      <RulesDialog openDialog={isDialogOpened} title="Password rules :" closeDialog={() => setIsDialogOpened(false)}>
        <PasswordRules />
      </RulesDialog>
      <TextField
        {...props}
        color={inputColor(props.error, props.success)}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        variant="standard"
        autoComplete="current-password"
        InputLabelProps={{ shrink: !!(isSelected || input) }}
        onChange={onChange}
        InputProps={{
          startAdornment,
          endAdornment: (
            <Stack direction="row" spacing="14px" alignItems="center">
              <InfoButton tooltipTitle={tooltipTitle} {...infoButtonProps} onClick={() => setIsDialogOpened(true)} />
              <ToggleVisibilityButton visible={showPassword} onClick={toggleShowPassword} />
            </Stack>
          ),
        }}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
      />
    </>
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

function inputColor(
  error?: boolean,
  success?: boolean
): 'success' | 'error' | 'primary' | 'secondary' | 'info' | 'warning' | undefined {
  return error ? 'error' : success ? 'success' : 'primary';
}

const PasswordRules = () => {
  return (
    <Typography variant="body1">
      <List>
        <ListItem>
          <ListItemIcon>
            <GppMaybe />
          </ListItemIcon>
          The password must contain at least 1 lowercase alphabetical character.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <GppMaybe />
          </ListItemIcon>
          The password must contain at least 1 uppercase alphabetical character.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <GppMaybe />
          </ListItemIcon>
          The password must contain at least 1 numeric character.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <GppMaybe />
          </ListItemIcon>
          The password must contain at least 1 special character.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <GppMaybe />
          </ListItemIcon>
          The password must be 10 characters or longer to be considered strong.
        </ListItem>
      </List>
    </Typography>
  );
};

const UsernameRules = () => {
  return (
    <Typography variant="body1">
      <List>
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          The username must be 3 to 32 characters long.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          The username may contain lowercase and uppercase alphabetical characters.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          The username may contain hyphens {'(-)'}.
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          The username may contain underscores {'(_)'}.
        </ListItem>
      </List>
    </Typography>
  );
};
