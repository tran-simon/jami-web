/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
/// <reference types="webpack/module" />
'use strict';
import './index.scss';
import './i18n';

// import config from "../sentry-client.config.json"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import socketio from 'socket.io-client';

import { store } from '../redux/store';
import App from './App';
import { SocketProvider } from './contexts/Socket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity, // websocket is responsible to tell when data needs to be updated
    },
  },
});

const socket = socketio();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to get the root element');
}
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
      render(<App />, container);
    } catch (e) {
      location.reload();
    }
  });
