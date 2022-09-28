import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';

const ServerOverview = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [account, setAccount] = useState();
  const accountId = props.accountId || props.match.params.accountId;

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/serverConfig`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setLoaded(true);
        setAccount(Account.from(result));
      })
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [accountId]);

  return (
    <Container maxWidth="sm" className="app">
      <Header />
      {loaded ? <AccountPreferences account={account} /> : <CircularProgress />}
    </Container>
  );
};

export default ServerOverview;
