"use strict";
import "./index.scss";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

// import config from "../sentry-client.config.json"
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

//import { CssBaseline } from '@mui/material'
//import * as serviceWorker from './serviceWorker'

const rootEl = document.getElementById("root");
var exports = {};

// Sentry.init({
//   ...config,
//   integrations: [new BrowserTracing()],
// });

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
