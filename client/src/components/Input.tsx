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
import { IconButtonProps, Stack, TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChangeEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StrengthValueCode } from '../utils/auth';
import { InfoButton, ToggleVisibilityButton } from './Button';
import { DialogContentList, InfosDialog, useDialogHandler } from './Dialog';
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

export type NameStatus = 'default' | 'success' | 'taken' | 'invalid' | 'registration_failed';
export type PasswordStatus = StrengthValueCode | 'registration_failed';

export type InputProps<StatusType extends NameStatus | PasswordStatus> = TextFieldProps & {
  status?: StatusType;
  infoButtonProps?: IconButtonProps;
  success?: boolean;
  tooltipTitle: string;
};

export const UsernameInput = ({
  infoButtonProps,
  onChange: _onChange,
  success,
  status = 'default',
  tooltipTitle,
  ...props
}: InputProps<NameStatus>) => {
  const { t } = useTranslation();
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();
  const dialogHandler = useDialogHandler();

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
    } else if (success) {
      Icon = StyledCheckedIconSuccess;
    } else if (!isSelected && !input) {
      visibility = 'hidden'; // keep icon's space so text does not move
    }
    setStartAdornment(<Icon sx={{ visibility }} />);
  }, [props.error, success, isSelected, input]);

  /*
  t('username_input_helper_text_success')
  t('username_input_helper_text_taken')
  t('username_input_helper_text_invalid')
  t('username_input_helper_text_registration_failed')
 */
  const helperText = t('username_input_helper_text', { context: `${status}` });

  return (
    <>
      <InfosDialog {...dialogHandler.props} title={t('username_rules_dialog_title')} content={<UsernameRules />} />
      <TextField
        color={inputColor(props.error, success)}
        label={t('username_input_label')}
        variant="standard"
        helperText={status !== 'default' ? helperText : ''}
        onChange={onChange}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
        {...props}
        InputLabelProps={{
          shrink: !!(isSelected || input),
          ...props.InputLabelProps,
        }}
        InputProps={{
          startAdornment,
          endAdornment: (
            <InfoButton tooltipTitle={tooltipTitle} {...infoButtonProps} onClick={dialogHandler.openDialog} />
          ),
          ...props.InputProps,
        }}
      />
    </>
  );
};

export const PasswordInput = ({
  infoButtonProps,
  onChange: _onChange,
  success,
  tooltipTitle,
  status = 'default',
  ...props
}: InputProps<PasswordStatus>) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [input, setInput] = useState(props.defaultValue);
  const [startAdornment, setStartAdornment] = useState<ReactElement | undefined>();
  const dialogHandler = useDialogHandler();

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
    } else if (success) {
      Icon = StyledCheckedIconSuccess;
    } else if (!isSelected && !input) {
      visibility = 'hidden'; // keep icon's space so text does not move
    }
    setStartAdornment(<Icon sx={{ visibility }} />);
  }, [props.error, success, isSelected, input]);

  /*
  t('password_input_helper_text_too_weak')
  t('password_input_helper_text_weak')
  t('password_input_helper_text_medium')
  t('password_input_helper_text_strong')
  t('password_input_helper_text_registration_failed')
   */
  const helperText = t('password_input_helper_text', { context: `${status}` });

  return (
    <>
      <InfosDialog {...dialogHandler.props} title={t('password_rules_dialog_title')} content={<PasswordRules />} />
      <TextField
        color={inputColor(props.error, success)}
        label={t('password_input_label')}
        type={showPassword ? 'text' : 'password'}
        variant="standard"
        autoComplete="current-password"
        helperText={status !== 'default' ? helperText : ''}
        onChange={onChange}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
        {...props}
        InputLabelProps={{ shrink: !!(isSelected || input), ...props.InputLabelProps }}
        InputProps={{
          startAdornment,
          endAdornment: (
            <Stack direction="row" spacing="14px" alignItems="center">
              <InfoButton tooltipTitle={tooltipTitle} {...infoButtonProps} onClick={dialogHandler.openDialog} />
              <ToggleVisibilityButton visible={showPassword} onClick={toggleShowPassword} />
            </Stack>
          ),
          ...props.InputProps,
        }}
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
  const { t } = useTranslation();
  const items = useMemo(
    () => [
      {
        Icon: GppMaybe,
        value: t('password_rule_one'),
      },
      {
        Icon: GppMaybe,
        value: t('password_rule_two'),
      },
      {
        Icon: GppMaybe,
        value: t('password_rule_three'),
      },
      {
        Icon: GppMaybe,
        value: t('password_rule_four'),
      },
      {
        Icon: GppMaybe,
        value: t('password_rule_five'),
      },
    ],
    [t]
  );
  return <DialogContentList items={items} />;
};

const UsernameRules = () => {
  const { t } = useTranslation();
  const items = useMemo(
    () => [
      {
        Icon: Warning,
        value: t('username_rule_one'),
      },
      {
        Icon: Warning,
        value: t('username_rule_two'),
      },
      {
        Icon: Warning,
        value: t('username_rule_three'),
      },
      {
        Icon: Warning,
        value: t('username_rule_four'),
      },
    ],
    [t]
  );
  return <DialogContentList items={items} />;
};
