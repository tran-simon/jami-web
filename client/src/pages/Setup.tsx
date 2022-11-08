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
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import LoadingPage from '../components/Loading';

export default function Setup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const accessToken = localStorage.getItem('adminAccessToken');

  const adminLogout = () => {
    localStorage.removeItem('adminAccessToken');
    navigate('/login');
  };

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Button variant="contained" type="submit" onClick={adminLogout}>
        {t('logout')}
      </Button>
      <LoadingPage />
    </>
  );
}
