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
import { Account } from 'jami-web-common/dist/Account';
import { HttpStatusCode } from 'jami-web-common/dist/enums/http-status-code';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProcessingRequest from '../components/ProcessingRequest';
import { apiUrl } from '../utils/constants';
import { WithChildren } from '../utils/utils';

interface IAuthContext {
  token: string;
  account: Account;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default ({ children }: WithChildren) => {
  const [token, setToken] = useState<string | undefined>();
  const [account, setAccount] = useState<Account | undefined>();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    navigate('/');
  }, [navigate]);

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
    if (token) {
      const getAccount = async () => {
        const url = new URL('/account', apiUrl);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === HttpStatusCode.Ok) {
          const serializedAccount = await response.json();
          const account = Account.from(serializedAccount);
          setAccount(account);
        } else {
          throw new Error(response.statusText);
        }
      };

      getAccount().catch((e) => {
        console.error('Error while retrieving account: ', e);
        logout();
      });
    }
  }, [token, logout]);

  if (!token || !account) {
    return <ProcessingRequest open />;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        logout,
        account,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(dontThrowIfUndefined: true): IAuthContext | undefined;
export function useAuthContext(): IAuthContext;
export function useAuthContext(dontThrowIfUndefined?: true) {
  const authContext = useContext(AuthContext);
  if (!authContext && !dontThrowIfUndefined) {
    throw new Error('AuthContext is not provided');
  }
  return authContext;
}
