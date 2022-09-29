import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';

const ServerOverview = (props) => {
  this.accountId = props.accountId || props.match.params.accountId;

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/serverConfig`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setState({ loaded: true, account: Account.from(result) });
      })
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [accountId]);

  return (
    <Container maxWidth="sm" className="app">
      <Header />
      {this.state.loaded ? <AccountPreferences account={this.state.account} /> : <CircularProgress />}
    </Container>
  );
};

export default ServerOverview;
