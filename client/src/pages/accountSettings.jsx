import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router';
import { Container, CircularProgress } from '@mui/material';
import Header from '../components/Header'
import AccountPreferences from '../components/AccountPreferences'
import authManager from '../AuthManager'
import Account from '../../../model/Account'
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setAccountId } from '../../redux/appSlice';

const AccountSettings = (props) => {
  const accountId = props.accountId || useParams().accountId
  const dispatch = useAppDispatch();

  const [state, setState] = useState({ loaded: false })

  useEffect(() => {
    dispatch(setAccountId(accountId))

    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        let account = Account.from(result)
        account.setDevices(result.devices)
        setState({ loaded: true, account: account})

      }).catch(e => console.log(e))
     // return () => controller.abort() // crash on React18
  }, [accountId])

  return (
    <Container maxWidth="sm">
      <Header />
      {state.loaded ? <AccountPreferences account={state.account} onAccontChanged={account => setState(state => {
        state.account = account
        return state
      })} /> : <CircularProgress />}
    </Container>
  )
}

export default AccountSettings;