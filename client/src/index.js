'use strict'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.js'
import './index.scss'
import { CssBaseline } from '@material-ui/core'

//import * as serviceWorker from './serviceWorker'
const rootEl = document.getElementById('root')

const render = Component =>
ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <Router>
    <Component />
    </Router>
  </React.StrictMode>,
  rootEl
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister()
render(App)

if (import.meta.webpackHot) import.meta.webpackHot.accept('./App', () => {
  try {
    render(App)
  } catch (e) {
    location.reload()
  }
})