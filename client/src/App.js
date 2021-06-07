/*
  Company: Savoir-faire Linux
  Author: Larbi Gharib <larbi.gharib@savoirfairelinux.com>
  License: AGPL-3
*/
import React, { useState, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import authManager from './AuthManager'
//import logo from './logo.svg'
import './App.scss'

import SignInPage from "./pages/loginDialog.jsx"
import JamiMessenger from "./pages/JamiMessenger.jsx"
import AccountSettings from "./pages/accountSettings.jsx"
import AccountSelection from "./pages/accountSelection.jsx"
import ServerSetup from "./pages/serverSetup.jsx"
import AccountCreationDialog from "./pages/accountCreation.jsx"
import NotFoundPage from "./pages/404.jsx"
import LoadingPage from './components/loading'
import JamiAccountDialog from './pages/jamiAccountCreation.jsx'
import { AnimatePresence } from 'framer-motion'
import WelcomeAnimation from './components/welcome'

const App = (props) => {
    const [state, setState] = useState({
      loaded: false,
      auth: authManager.getState()
    })
    const [displayWelcome, setDisplayWelcome] = useState(true)

    useEffect(() => {
      authManager.init(auth => {
        setState({ loaded: false, auth })
      })
      return () => authManager.deinit()
    }, []);

    console.log("App render")
    if (displayWelcome) {
      return <WelcomeAnimation showSetup={!state.auth.setupComplete} onComplete={() => setDisplayWelcome(false)} />
    } else if (!state.auth.setupComplete) {
      return <Switch>
          <Route path="/setup" component={ServerSetup} />
          <Route><Redirect to="/setup" /></Route>
        </Switch>
    }
    return <React.Fragment>
          <Route
      render={({ location }) => {
        console.log("App render location")

        return <AnimatePresence exitBeforeEnter initial={false}>
          <Switch location={location} key={location.pathname}>
            <Route exact path="/"><Redirect to="/account" /></Route>
            <Route path="/account/:accountId/settings" component={AccountSettings} />
            <Route path="/account/:accountId" component={JamiMessenger} />
            <Route path="/account" component={AccountSelection} />
            <Route path="/newAccount/jami" component={JamiAccountDialog} />
            <Route path="/newAccount" component={AccountCreationDialog} />
            <Route path="/setup"><Redirect to="/account" /></Route>
            <Route component={NotFoundPage} />
          </Switch>
          {!state.auth.authenticated && <SignInPage open={!state.auth.authenticated}/>}
        </AnimatePresence>}}
      />
    </React.Fragment>
}

export default App
