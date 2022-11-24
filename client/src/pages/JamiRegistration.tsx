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
import { ChangeEvent, FormEvent, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate } from 'react-router-dom';

import { AlertSnackbar } from '../components/AlertSnackbar';
import { NameStatus, PasswordInput, PasswordStatus, UsernameInput } from '../components/Input';
import ProcessingRequest from '../components/ProcessingRequest';
import { checkPasswordStrength, isNameRegistered, loginUser, registerUser, setAccessToken } from '../utils/auth';
import { inputWidth, jamiUsernamePattern } from '../utils/constants';
import { InvalidPassword, UsernameNotFound } from '../utils/errors';

type JamiRegistrationProps = {
  login: () => void;
};

export default function JamiRegistration(props: JamiRegistrationProps) {
  const theme: Theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<NameStatus>('default');
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>('default');

  const [errorAlertContent, setErrorAlertContent] = useState<ReactNode>(undefined);
  const [successAlertContent, setSuccessAlertContent] = useState<ReactNode>(undefined);

  const usernameError = usernameStatus !== 'success' && usernameStatus !== 'default';
  const usernameSuccess = usernameStatus === 'success';
  const passwordError = passwordStatus !== 'strong' && passwordStatus !== 'default';
  const passwordSuccess = passwordStatus === 'strong';

  useEffect(() => {
    // To prevent lookup if field is empty, in error state or lookup already done
    if (username.length > 0 && usernameStatus === 'default') {
      const validateUsername = async () => {
        if (await isNameRegistered(username)) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('success');
        }
      };
      const timeout = setTimeout(validateUsername, 1000);

      return () => clearTimeout(timeout);
    }
  }, [username, usernameStatus]);

  const firstUserLogin = async () => {
    try {
      const accessToken = await loginUser(username, password);
      setAccessToken(accessToken);
      navigate('/conversation', { replace: true });
    } catch (e) {
      setIsCreatingUser(false);
      if (e instanceof UsernameNotFound) {
        setErrorAlertContent(t('login_username_not_found'));
      } else if (e instanceof InvalidPassword) {
        setErrorAlertContent(t('login_invalid_password'));
      } else {
        throw e;
      }
    }
  };

  const createAccount = async () => {
    await registerUser(username, password);
    setSuccessAlertContent(t('registration_success'));
    await firstUserLogin();
  };

  const handleUsername = async (event: ChangeEvent<HTMLInputElement>) => {
    const usernameValue: string = event.target.value;
    setUsername(usernameValue);

    if (usernameValue.length > 0 && !jamiUsernamePattern.test(usernameValue)) {
      setUsernameStatus('invalid');
    } else {
      setUsernameStatus('default');
    }
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const passwordValue: string = event.target.value;
    setPassword(passwordValue);

    if (passwordValue.length > 0) {
      const checkResult = checkPasswordStrength(passwordValue);
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
      await createAccount();
    } else {
      if (usernameError || username.length === 0) {
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

      <AlertSnackbar
        severity={'success'}
        open={!!successAlertContent}
        onClose={() => setSuccessAlertContent(undefined)}
      >
        {successAlertContent}
      </AlertSnackbar>

      <AlertSnackbar severity={'error'} open={!!errorAlertContent} onClose={() => setErrorAlertContent(undefined)}>
        {errorAlertContent}
      </AlertSnackbar>

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
            {t('registration_form_title')}
          </Typography>
        </Box>

        <Form method="post" id="register-form">
          <div>
            <UsernameInput
              value={username}
              onChange={handleUsername}
              error={usernameError}
              success={usernameSuccess}
              status={usernameStatus}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
              tooltipTitle={t('registration_form_username_tooltip')}
            />
          </div>
          <div>
            <PasswordInput
              value={password}
              onChange={handlePassword}
              error={passwordError}
              success={passwordSuccess}
              status={passwordStatus}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
              tooltipTitle={t('registration_form_password_tooltip')}
            />
          </div>

          <Button
            variant="contained"
            type="submit"
            onClick={handleSubmit}
            sx={{ width: theme.typography.pxToRem(inputWidth), mt: theme.typography.pxToRem(20) }}
          >
            {t('registration_form_submit_button')}
          </Button>
        </Form>

        <Box sx={{ mt: theme.typography.pxToRem(50), mb: theme.typography.pxToRem(50) }}>
          <Typography variant="body1">
            {t('registration_form_to_login_text')} &nbsp;
            <a href="" onClick={login}>
              {t('registration_form_to_login_link')}
            </a>
          </Typography>
        </Box>
      </Stack>
    </>
  );
}
