/*
  Company: Savoir-faire Linux
  Author: Larbi Gharib <larbi.gharib@savoirfairelinux.com>
  License: AGPL-3
*/

import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import authManager from './AuthManager'
//import logo from './logo.svg';
import './App.scss';

import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';

import SignInPage from "./pages/loginDialog.jsx";
import JamiMessenger from "./pages/messenger.jsx"
import AccountSettings from "./pages/accountSettings.jsx"
import AccountSelection from "./pages/accountSelection.jsx"
import NotFoundPage from "./pages/404.jsx"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: authManager.isAuthenticated(),
    };
    authManager.setOnAuthChanged(authenticated => this.setState({authenticated}))
  }

  render() {
      return <React.Fragment>
        <CssBaseline />
        <Router>
          <Switch>
            <Route exact path="/"><Redirect to="/account" /></Route>
            <Route path="/account/:accountId" component={AccountSettings} />
            <Route path="/account" component={AccountSelection} />
            <Route path="/messaging" component={JamiMessenger} />
            <Route component={NotFoundPage} />
          </Switch>
        </Router>
        {!this.state.authenticated && <SignInPage open={!this.state.authenticated}/>}
      </React.Fragment>
  }
}

export default App