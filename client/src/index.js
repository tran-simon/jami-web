'use strict';
import './index.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { store } from '../redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';

// import config from "../sentry-client.config.json"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import socketio from 'socket.io-client';
import { SocketProvider } from './contexts/socket.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity, // websocket is responsible to tell when data needs to be updated
    },
  },
});

const socket = socketio();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SocketProvider socket={socket}>
          <Router>
            <App />
          </Router>
        </SocketProvider>
      </QueryClientProvider>
    </StrictMode>
  </Provider>
);

if (import.meta.webpackHot)
  import.meta.webpackHot.accept('./App', () => {
    try {
      render(App);
    } catch (e) {
      location.reload();
    }
  });
