import React from 'react';
import Header from '../components/Header'
import AccountPreferences from '../components/AccountPreferences'
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import authManager from '../AuthManager'
import Account from '../../../model/Account'

class AccountSettings extends React.Component {

  constructor(props) {
    super(props)
    this.accountId = props.accountId || props.match.params.accountId
    this.state = { loaded: false, account: props.account }
    this.req = undefined
  }

  componentDidMount() {
    this.controller = new AbortController()
    if (this.req === undefined) {
      this.req = authManager.fetch(`/api/accounts/${this.accountId}`, {signal: this.controller.signal})
        .then(res => res.json())
        .then(result => {
          console.log(result)
          this.setState({loaded: true, account: Account.from(result)})
        })
    }
  }

  componentWillUnmount() {
    this.controller.abort()
    this.req = undefined
  }

  render() {
    return (
      <Container maxWidth="sm" className="app" >
        <Header />
        {this.state.loaded ? <AccountPreferences account={this.state.account} /> : <CircularProgress />}
      </Container>
    )
  }
}

export default AccountSettings;