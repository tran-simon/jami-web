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
import { ChangeEvent, FormEvent, MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';

import { AlertSnackbar } from '../components/AlertSnackbar';
import { PasswordInput, UsernameInput } from '../components/Input';
import ProcessingRequest from '../components/ProcessingRequest';
import { useRouteNavigate } from '../hooks/routingHooks';
import { conversationRouteDescriptor } from '../router';
import { loginUser, setAccessToken } from '../utils/auth';
import { inputWidth } from '../utils/constants';
import { InvalidPassword, UsernameNotFound } from '../utils/errors';

type JamiLoginProps = {
  register: () => void;
};

export default function JamiLogin(props: JamiLoginProps) {
  const theme: Theme = useTheme();
  const navigate = useRouteNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingInUser, setIsLoggingInUser] = useState<boolean>(false);
  const [errorAlertContent, setErrorAlertContent] = useState<ReactNode>(undefined);

  const handleUsername = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const register = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    props.register();
  };

  const authenticateUser = async (event: FormEvent) => {
    event.preventDefault();
    if (username.length > 0 && password.length > 0) {
      setIsLoggingInUser(true);

      try {
        const accessToken = await loginUser(username, password);
        setAccessToken(accessToken);
        navigate(conversationRouteDescriptor, {
          urlParams: {
            conversationId: undefined,
          },
          replace: true,
        });
      } catch (e) {
        setIsLoggingInUser(false);
        if (e instanceof UsernameNotFound) {
          setErrorAlertContent(t('login_username_not_found'));
        } else if (e instanceof InvalidPassword) {
          setErrorAlertContent(t('login_invalid_password'));
        } else {
          throw e;
        }
      }
    }
  };

  const isMobile: boolean = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <>
      <ProcessingRequest open={isLoggingInUser} />

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
            {t('login_form_title')}
          </Typography>
        </Box>

        <Form method="post" id="login-form">
          <div>
            <UsernameInput
              onChange={handleUsername}
              tooltipTitle={t('login_form_username_tooltip')}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
            />
          </div>
          <div>
            <PasswordInput
              onChange={handlePassword}
              tooltipTitle={t('login_form_password_tooltip')}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
            />
          </div>

          <Button
            variant="contained"
            type="submit"
            onClick={authenticateUser}
            sx={{ width: theme.typography.pxToRem(inputWidth), mt: theme.typography.pxToRem(20) }}
          >
            {t('login_form_submit_button')}
          </Button>
        </Form>

        <Box sx={{ mt: theme.typography.pxToRem(50), mb: theme.typography.pxToRem(50) }}>
          <Typography variant="body1">
            {t('login_form_to_registration_text')} &nbsp;
            <a href="" onClick={register}>
              {t('login_form_to_registration_link')}
            </a>
          </Typography>
        </Box>
      </Stack>
    </>
  );
}
