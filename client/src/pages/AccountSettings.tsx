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
