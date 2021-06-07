import React, { useEffect, useState } from 'react';
import { Avatar, Card, CardHeader, Container, List } from '@material-ui/core';
import Header from '../components/Header'
import authManager from '../AuthManager'
import Account from '../../../model/Account';
import LoadingPage from '../components/loading';
import ListItemLink from '../components/ListItemLink';
import ConversationAvatar from '../components/ConversationAvatar';
import { AddRounded } from '@material-ui/icons';
import { useHistory } from 'react-router';

const AccountSelection = (props) => {
  const history = useHistory()
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
        if (result.length === 0) {
          history.replace('/newAccount')
        } else {
          setState({
            loaded: true,
            accounts: result.map(account => Account.from(account)),
          })
        }
      }, error => {
        console.log(`get error ${error}`)
        setState({
          loaded: true,
          error: true
        })
      }).catch(e => console.log(e))
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
          <List>
            {state.accounts.map(account => <ListItemLink key={account.getId()}
              icon={<ConversationAvatar displayName={account.getDisplayNameNoFallback()} />}
              to={`/account/${account.getId()}/settings`}
              primary={account.getDisplayName()}
              secondary={account.getDisplayUri()} />)}
            <ListItemLink
              icon={<Avatar><AddRounded /></Avatar>}
              to='/newAccount'
              primary="Create new account" />
          </List>
        </Card>
      </Container>
    </React.Fragment>
  )
}

export default AccountSelection