import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';

type ServerOverviewProps = {
  accountId?: string;
};

const ServerOverview = (props: ServerOverviewProps) => {
  const [account, setAccount] = useState<Account | null>(null);
  const params = useParams();
  const accountId = props.accountId || params.accountId;

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/serverConfig`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setAccount(Account.from(result));
      })
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [accountId]);

  return (
    <Container maxWidth="sm" className="app">
      <Header />
      {account != null ? <AccountPreferences account={account} /> : <CircularProgress />}
    </Container>
  );
};

export default ServerOverview;
