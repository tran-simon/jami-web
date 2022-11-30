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
import axios, { AxiosInstance } from 'axios';
import { HttpStatusCode, IAccount } from 'jami-web-common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProcessingRequest from '../components/ProcessingRequest';
import { createOptionalContext } from '../hooks/createOptionalContext';
import { Account } from '../models/account';
import { apiUrl } from '../utils/constants';
import { WithChildren } from '../utils/utils';

interface IAuthContext {
  token: string;
  account: Account;
  accountId: string;
  logout: () => void;
  axiosInstance: AxiosInstance;
}

const optionalAuthContext = createOptionalContext<IAuthContext>('AuthContext');
const AuthContext = optionalAuthContext.Context;
export const useAuthContext = optionalAuthContext.useOptionalContext;

export default ({ children }: WithChildren) => {
  const [token, setToken] = useState<string | undefined>();
  const [account, setAccount] = useState<Account | undefined>();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  }, [navigate]);

  const axiosInstance = useMemo(() => {
    if (!token) {
      return;
    }

    const instance = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    instance.interceptors.response.use(
      (res) => res,
      (e) => {
        switch (e.response?.status) {
          case HttpStatusCode.Unauthorized:
            logout();
            break;
        }
        throw e;
      }
    );

    return instance;
  }, [token, logout]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      console.warn('Missing authentication JWT. Redirecting to login page...');
      logout();
    } else {
      setToken(accessToken);
    }
  }, [logout]);

  useEffect(() => {
    if (!axiosInstance) {
      return;
    }

    axiosInstance.get<IAccount>('/account').then(({ data }) => setAccount(Account.fromInterface(data)));
  }, [axiosInstance, logout]);

  if (!token || !account || !axiosInstance) {
    return <ProcessingRequest open />;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        logout,
        account,
        accountId: account.id,
        axiosInstance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
