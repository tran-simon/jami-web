'use strict'
import './index.scss'
import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './App.js'
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import './i18n';

// import config from "../sentry-client.config.json"
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <App/>
      </Router>
    </React.StrictMode>
  </Provider>
);

if (import.meta.webpackHot)
  import.meta.webpackHot.accept("./App", () => {
    try {
      render(App);
    } catch (e) {
      location.reload();
    }
  });
