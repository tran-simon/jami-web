"use strict";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.js";
import "./index.scss";

import { store } from "../redux/store";
import { Provider } from "react-redux";
//import { CssBaseline } from '@mui/material'

//import * as serviceWorker from './serviceWorker'
const rootEl = document.getElementById("root");
var exports = {};

const render = (Component) =>
  ReactDOM.render(
    <Provider store={store}>
      <React.StrictMode>
        <Router>
          <Component />
        </Router>
      </React.StrictMode>
    </Provider>,
    rootEl
  );

render(App)

if (import.meta.webpackHot)
  import.meta.webpackHot.accept("./App", () => {
    try {
      render(App);
    } catch (e) {
      location.reload();
    }
  });
