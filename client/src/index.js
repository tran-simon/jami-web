'use strict'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.js'
import './index.scss'

const rootEl = document.getElementById('root')

const render = Component =>
ReactDOM.render(
  <React.StrictMode>
    <Router>
    <Component />
    </Router>
  </React.StrictMode>,
  rootEl
)

render(App)

if (import.meta.webpackHot) import.meta.webpackHot.accept('./App', () => {
  try {
    render(App)
  } catch (e) {
    location.reload()
  }
})