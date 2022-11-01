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
import { Box, Button, Stack, Typography, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';

import { PasswordInput, UsernameInput } from '../components/Input';
import ProcessingRequest from '../components/ProcessingRequest';
import { checkPasswordStrength, isNameRegistered, StrengthValueCode } from '../utils/auth';
import { inputWidth, jamiUsernamePattern } from '../utils/constants';

const usernameTooltipTitle =
  'Choose a password hard to guess for others but easy to remember for you, ' +
  'it must be at least 8 characters. ' +
  "Your account won't be recovered if you forget it!\n\n" +
  'Click for more details';

const passwordTooltipTitle =
  'Username may be from 3 to 32 chraracters long and contain a-z, A-Z, -, _\n\n' + 'Click for more details';

type NameStatus = 'default' | 'success' | 'taken' | 'invalid' | 'registration_failed';
type PasswordStatus = StrengthValueCode | 'registration_failed';

type JamiRegistrationProps = {
  login: () => void;
};

export default function JamiRegistration(props: JamiRegistrationProps) {
  const theme: Theme = useTheme();
  const { t } = useTranslation();

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [usernameValue, setUsernameValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<NameStatus>('default');
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>('default');

  const usernameError = usernameStatus !== 'success' && usernameStatus !== 'default';
  const usernameSuccess = usernameStatus === 'success';
  const passwordError = passwordStatus !== 'strong' && passwordStatus !== 'default';
  const passwordSuccess = passwordStatus === 'strong';

  useEffect(() => {
    // To prevent lookup if field is empty, in error state or lookup already done
    if (usernameValue.length > 0 && usernameStatus === 'default') {
      const validateUsername = async () => {
        if (await isNameRegistered(usernameValue)) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('success');
        }
      };
      const timeout = setTimeout(validateUsername, 1000);

      return () => clearTimeout(timeout);
    }
  }, [usernameValue, usernameStatus]);

  const handleUsername = async (event: ChangeEvent<HTMLInputElement>) => {
    const username: string = event.target.value;
    setUsernameValue(username);

    if (username.length > 0 && !jamiUsernamePattern.test(username)) {
      setUsernameStatus('invalid');
    } else {
      setUsernameStatus('default');
    }
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const password: string = event.target.value;
    setPasswordValue(password);

    if (password.length > 0) {
      const checkResult = checkPasswordStrength(password);
      setPasswordStatus(checkResult.valueCode);
    } else {
      setPasswordStatus('default');
    }
  };

  const login = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    props.login();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const canCreate = usernameSuccess && passwordSuccess;

    if (canCreate) {
      setIsCreatingUser(true);
      // TODO: Replace with registration logic (https://git.jami.net/savoirfairelinux/jami-web/-/issues/75).
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Account created');
      setIsCreatingUser(false);
    } else {
      if (usernameError || usernameValue.length === 0) {
        setUsernameStatus('registration_failed');
      }
      if (!passwordSuccess) {
        setPasswordStatus('registration_failed');
      }
    }
  };

  const isMobile: boolean = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <>
      <ProcessingRequest open={isCreatingUser} />

      <Stack
        sx={{
          minHeight: `${isMobile ? 'auto' : '100%'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ mt: theme.typography.pxToRem(50), mb: theme.typography.pxToRem(20) }}>
          <Typography component={'span'} variant="h2">
            REGISTRATION
          </Typography>
        </Box>

        <Form method="post" id="register-form">
          <div>
            <UsernameInput
              value={usernameValue}
              onChange={handleUsername}
              error={usernameError}
              success={usernameSuccess}
              helperText={t(`username_input_${usernameStatus}_helper_text`)}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
              tooltipTitle={usernameTooltipTitle}
            />
          </div>
          <div>
            <PasswordInput
              value={passwordValue}
              onChange={handlePassword}
              error={passwordError}
              success={passwordSuccess}
              helperText={t(`password_input_${passwordStatus}_helper_text`)}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
              tooltipTitle={passwordTooltipTitle}
            />
          </div>

          <Button
            variant="contained"
            type="submit"
            onClick={handleSubmit}
            sx={{ width: theme.typography.pxToRem(inputWidth), mt: theme.typography.pxToRem(20) }}
          >
            REGISTER
          </Button>
        </Form>

        <Box sx={{ mt: theme.typography.pxToRem(50), mb: theme.typography.pxToRem(50) }}>
          <Typography variant="body1">
            Already have an account ? &nbsp;
            <a href="" onClick={login}>
              LOG IN
            </a>
          </Typography>
        </Box>
      </Stack>
    </>
  );
}
