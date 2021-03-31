/*
  Company: Savoir-faire Linux
  Author: Larbi Gharib <larbi.gharib@savoirfairelinux.com>
  UI Project inspired from https://scrimba.com/p/pbNpTv/cbZBmfV
  License: AGPL-3
*/

import React from 'react';
//import logo from './logo.svg';
import './App.css';


import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';

import SignInPage from "./pages/index.jsx";
import Jaas from "./pages/jaas.jsx"
import NotFoundPage from "./pages/404.jsx"


class App extends React.Component {

  render() {
    return <Router>
      <Switch>
        <Route exact path="/" component={SignInPage} />
        <Route to="/Jaas" component={Jaas} />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>

    </Router>
  }
}

export default App;