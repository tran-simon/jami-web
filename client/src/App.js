/*
  Company: Savoir-faire Linux
  Author: Larbi Gharib <larbi.gharib@savoirfairelinux.com>
  License: AGPL-3
*/
import React, { useState, useEffect } from 'react'
import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import { CircularProgress, Container, CssBaseline } from '@material-ui/core'
import authManager from './AuthManager'
//import logo from './logo.svg'
import './App.scss'

import SignInPage from "./pages/loginDialog.jsx"
import JamiMessenger from "./pages/messenger.jsx"
import AccountSettings from "./pages/accountSettings.jsx"
import AccountSelection from "./pages/accountSelection.jsx"
import ServerSetup from "./pages/serverSetup.jsx"
import NotFoundPage from "./pages/404.jsx"
import LoadingPage from './components/loading'

const App = (props) => {
    const history = useHistory()
    const { location } = useLocation()
    const [state, setState] = useState({
      loaded: false,
      auth: authManager.getState()
    })
    useEffect(() => {
      authManager.init(auth => {
        setState({ loaded: true, auth })
      })
      return () => authManager.deinit()
    }, []);

    console.log("App render")
    console.log(state)
    console.log(location)

    if (!state.loaded) {
      return <LoadingPage />
    } else if (!state.auth.setupComplete) {
      return <Switch>
          <Route path="/setup" component={ServerSetup} />
          <Route><Redirect to="/setup" /></Route>
        </Switch>
    }
    return <React.Fragment>
        <Switch>
          <Route exact path="/"><Redirect to="/account" /></Route>
          <Route path="/account/:accountId/settings" component={AccountSettings} />
          <Route path="/account/:accountId/addContact/:contactId" component={JamiMessenger} />
          <Route path="/account/:accountId/conversation/:conversationId" component={JamiMessenger} />
          <Route path="/account/:accountId" component={JamiMessenger} />
          <Route path="/account" component={AccountSelection} />
          <Route component={NotFoundPage} />
        </Switch>
      {!state.auth.authenticated && <SignInPage open={!state.auth.authenticated}/>}
    </React.Fragment>
}

export default App
