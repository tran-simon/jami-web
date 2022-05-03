import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router';
import { Container, CircularProgress } from '@mui/material';
import Header from '../components/Header'
import AccountPreferences from '../components/AccountPreferences'
import authManager from '../AuthManager'
import Account from '../../../model/Account'

const AccountSettings = (props) => {
  const accountId = props.accountId || useParams().accountId
  const [state, setState] = useState({ loaded: false })

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}`, {signal: controller.signal})
      .then(res => res.json())
      .then(result => {
        console.log(result)
        setState({loaded: true, account: Account.from(result)})
      }).catch(e => console.log(e))
      return () => controller.abort()
  }, [accountId])

  return (
    <Container maxWidth="sm">
      <Header />
      {state.loaded ? <AccountPreferences account={state.account} onAccontChanged={account => setState(state => {
        state.account =  account
        return state
      })} /> : <CircularProgress />}
    </Container>
  )
}

export default AccountSettings;