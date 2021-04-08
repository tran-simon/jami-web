import React from 'react';
import Header from '../components/Header'
import authManager from '../AuthManager'
import AccountList from '../components/AccountList';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Container from '@material-ui/core/Container';
import Account from '../../../model/Account';

class AccountSelection extends React.Component {

  constructor(props) {
    super(props)
    this.controller = new AbortController()
    this.state = {
      loaded: false,
      error: false,
      accounts: []
    }
  }

  componentDidMount() {
    if (!this.state.loaded) {
      authManager.fetch('/api/accounts', {signal: this.controller.signal})
        .then(res => res.json())
        .then(result => {
          console.log(result)
          this.setState({
            loaded: true,
            accounts: result.map(account => Account.from(account)),
          })
        }, error => {
          console.log(`get error ${error}`)
          this.setState({
            loaded: true,
            error: true
          })
        })
      }
  }
  componentWillUnmount() {
    this.controller.abort()
  }

  render() {
    if (!this.state.loaded)
      return <Container><CircularProgress /></Container>
    return (
      <div className="app" style={{marginBottom:32}} >
        <Header />
        <Container>
          <Card style={{marginTop:32, marginBottom:32}}>
            <CardHeader title="Choose an account" />
            <AccountList accounts={this.state.accounts} onClick={account => this.props.history.push(`/account/${account.getId()}`)} />
          </Card>
        </Container>
      </div>
    )
  }
}

export default withRouter(AccountSelection);