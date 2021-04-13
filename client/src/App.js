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

import SignInPage from "./pages/loginDialog.jsx"
import JamiMessenger from "./pages/messenger.jsx"
import AccountSettings from "./pages/accountSettings.jsx"
import AccountSelection from "./pages/accountSelection.jsx"
import AddContactPage from "./pages/addContactPage.jsx"

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
    console.log("App render")
    console.log(this.props)

      return <React.Fragment>
        <CssBaseline />
        <Router>
          <Switch>
            <Route exact path="/"><Redirect to="/account" /></Route>
            <Route path="/account/:accountId/settings" component={AccountSettings} />
            <Route path="/account/:accountId/addContact/:contactId" component={JamiMessenger} />
            <Route path="/account/:accountId/conversation/:conversationId" component={JamiMessenger} />
            <Route path="/account/:accountId" component={JamiMessenger} />
            <Route path="/account" component={AccountSelection} />
            <Route component={NotFoundPage} />
          </Switch>
        </Router>
        {!this.state.authenticated && <SignInPage open={!this.state.authenticated}/>}
      </React.Fragment>
  }
}

export default App