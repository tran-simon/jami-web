import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
//import * as serviceWorker from './serviceWorker';
const rootEl = document.getElementById('root');

const render = Component =>
ReactDOM.render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>,
  rootEl
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
render(App)
if (module.hot) module.hot.accept('./App', () => {
  try {
    render(App)
  } catch (e) {
    location.reload()
  }
})