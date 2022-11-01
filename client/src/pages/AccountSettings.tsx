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
import { Container } from '@mui/material';
import { Account, HttpStatusCode } from 'jami-web-common';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';
import ProcessingRequest from '../components/ProcessingRequest';
import { setAccount } from '../redux/appSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getAccessToken, setAccessToken } from '../utils/auth';
import { apiUrl } from '../utils/constants';

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { account } = useAppSelector((state) => state.userInfo);
  const accessToken = getAccessToken();

  useEffect(() => {
    if (accessToken) {
      const getAccount = async () => {
        const url = new URL('/account', apiUrl);
        let response: Response;

        try {
          response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            referrerPolicy: 'no-referrer',
          });
        } catch (err) {
          setAccessToken('');
          dispatch(setAccount(undefined));
          navigate('/', { replace: true });
          return;
        }

        if (response.status === HttpStatusCode.Ok) {
          const serializedAccount = await response.json();
          const account = Account.from(serializedAccount);
          dispatch(setAccount(account));
        } else if (response.status === HttpStatusCode.Unauthorized) {
          setAccessToken('');
          dispatch(setAccount(undefined));
          navigate('/', { replace: true });
        }
      };

      getAccount();
    }
  }, [accessToken, dispatch, navigate]);

  // TODO: Improve component and sub-components UI.
  return (
    <Container maxWidth="sm">
      <Header />
      {account ? <AccountPreferences account={account} /> : <ProcessingRequest open={true} />}
    </Container>
  );
}
