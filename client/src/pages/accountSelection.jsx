import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, CardHeader, Container, CircularProgress } from '@material-ui/core';
import Header from '../components/Header'
import AccountList from '../components/AccountList';
import authManager from '../AuthManager'
import Account from '../../../model/Account';
import LoadingPage from '../components/loading';

const AccountSelection = (props) => {
  const [state, setState] = useState({
    loaded: false,
    error: false,
    accounts: []
  })

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts`, {signal: controller.signal})
      .then(res => res.json())
      .then(result => {
        console.log(result)
        setState({
          loaded: true,
          accounts: result.map(account => Account.from(account)),
        })
      }, error => {
        console.log(`get error ${error}`)
        setState({
          loaded: true,
          error: true
        })
      })
    return () => controller.abort()
  }, [])

  if (!state.loaded)
    return <LoadingPage />
  return (
    <React.Fragment>
      <Header />
      <Container maxWidth="sm" style={{paddingBottom:32}}>
        <Card style={{marginTop:32, marginBottom:32}}>
          <CardHeader title="Choose an account" />
          <AccountList accounts={state.accounts} onClick={account => props.history.push(`/account/${account.getId()}/settings`)} />
        </Card>
      </Container>
    </React.Fragment>
  )
}

export default withRouter(AccountSelection);