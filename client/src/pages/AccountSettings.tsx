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
import { CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import Account from '../../../model/Account';
import { setAccountId, setAccountObject } from '../../redux/appSlice';
import { useAppDispatch } from '../../redux/hooks';
import authManager from '../AuthManager';
import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';

type AccountSettingsProps = {
  accountId?: string;
  account?: Account;
};

const AccountSettings = (props: AccountSettingsProps) => {
  console.log('ACCOUNT SETTINGS', props.account);
  const params = useParams();
  const accountId = props.accountId || params.accountId;

  if (accountId == null) {
    throw new Error('Missing accountId');
  }

  const dispatch = useAppDispatch();

  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(setAccountId(accountId));

    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        const account = Account.from(result);
        account.setDevices(result.devices);
        dispatch(setAccountObject(account));
        setAccount(account);
      })
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [accountId, dispatch]);

  return (
    <Container maxWidth="sm">
      <Header />
      {account != null ? (
        <AccountPreferences account={account} onAccountChanged={(account: Account) => setAccount(account)} />
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
};

export default AccountSettings;
