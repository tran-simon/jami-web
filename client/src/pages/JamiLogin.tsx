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
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';
import { Form } from 'react-router-dom';

import { PasswordInput, UsernameInput } from '../components/Input';
import ProcessingRequest from '../components/ProcessingRequest';
import { inputWidth } from '../utils/constants';

type JamiLoginProps = {
  register: () => void;
};

export default function JamiLogin(props: JamiLoginProps) {
  const theme: Theme = useTheme();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingInUser, setIsLoggingInUser] = useState<boolean>(false);

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

      // TODO: Replace with login logic (https://git.jami.net/savoirfairelinux/jami-web/-/issues/75).
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Login');
      setIsLoggingInUser(false);
    }
  };

  const isMobile: boolean = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <>
      <ProcessingRequest open={isLoggingInUser} />

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
            LOGIN
          </Typography>
        </Box>

        <Form method="post" id="login-form">
          <div>
            <UsernameInput
              onChange={handleUsername}
              tooltipTitle={'The username you registered with'}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
            />
          </div>
          <div>
            <PasswordInput
              onChange={handlePassword}
              tooltipTitle={'The password you registered with'}
              sx={{ width: theme.typography.pxToRem(inputWidth) }}
            />
          </div>

          <Button
            variant="contained"
            type="submit"
            onClick={authenticateUser}
            sx={{ width: theme.typography.pxToRem(inputWidth), mt: theme.typography.pxToRem(20) }}
          >
            LOG IN
          </Button>
        </Form>

        <Box sx={{ mt: theme.typography.pxToRem(50), mb: theme.typography.pxToRem(50) }}>
          <Typography variant="body1">
            Need an account ? &nbsp;
            <a href="" onClick={register}>
              REGISTER
            </a>
          </Typography>
        </Box>
      </Stack>
    </>
  );
}
