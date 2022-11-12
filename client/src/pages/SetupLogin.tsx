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
import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import { Box, Card, CardContent, Container, Fab, Input, Typography } from '@mui/material';
import axios from 'axios';
import { HttpStatusCode } from 'jami-web-common';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { checkSetupStatus } from '../App';
import { apiUrl } from '../utils/constants';
import { InvalidPassword } from '../utils/errors';

export default function SetupLogin() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    checkSetupStatus().then(setIsSetupComplete);
  }, []);

  const registerAdmin = async (password: string) => {
    await axios.post('/setup/admin/create', { password }, { baseURL: apiUrl });
  };

  const loginAdmin = async (password: string) => {
    try {
      const { data } = await axios.post('/setup/admin/login', { password }, { baseURL: apiUrl });
      localStorage.setItem('adminAccessToken', data.accessToken);
    } catch (e: any) {
      if (e.response?.status === HttpStatusCode.Forbidden) {
        throw new InvalidPassword();
      } else {
        throw e;
      }
    }
  };

  const isValid = isSetupComplete || (password && password === passwordRepeat);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!isValid) return;

    try {
      if (!isSetupComplete) {
        await registerAdmin(password);
      }
      await loginAdmin(password);
    } catch (e) {
      console.error(e);
      navigate('/login');
      return;
    }
    navigate('/setup');
  };

  return (
    <Container className="message-list">
      <Card>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Typography gutterBottom variant="h5" component="h2">
            {t('setup_login_title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {t('setup_login_welcome')}
            <br />
            {isSetupComplete ? '' : t('setup_login_admin_creation')}
          </Typography>

          <Box style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
            <div>
              <Input value="admin" name="username" autoComplete="username" disabled />
            </div>
            <div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                placeholder={
                  isSetupComplete ? t('password_placeholder') : t('setup_login_password_placeholder_creation')
                }
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {!isSetupComplete && (
              <div>
                <Input
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  name="password"
                  error={!!passwordRepeat && !isValid}
                  type="password"
                  placeholder={t('setup_login_password_placeholder_repeat')}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            )}
          </Box>
          <Box style={{ textAlign: 'center', marginTop: 24 }}>
            <Fab variant="extended" color="primary" type="submit" disabled={!isValid || loading}>
              <GroupAddRounded />
              {isSetupComplete ? t('login_form_submit_button') : t('admin_creation_submit_button')}
            </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
