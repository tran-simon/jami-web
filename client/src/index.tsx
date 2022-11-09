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
'use strict';
import './index.scss';
import './i18n';

import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import socketio from 'socket.io-client';

import App from './App';
import ContactList from './components/ContactList';
import AuthProvider from './contexts/AuthProvider';
import { SocketProvider } from './contexts/Socket';
import WebSocketProvider from './contexts/WebSocketProvider';
import AccountSettings from './pages/AccountSettings';
import JamiMessenger from './pages/JamiMessenger';
import ServerSetup from './pages/ServerSetup';
import Welcome from './pages/Welcome';
import { store } from './redux/store';
import defaultTheme from './themes/Default';
import { ThemeDemonstrator } from './themes/ThemeDemonstrator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity, // websocket is responsible to tell when data needs to be updated
    },
  },
});

const socket = socketio();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Welcome />} />
      <Route path="theme" element={<ThemeDemonstrator />} />
      <Route
        element={
          <AuthProvider>
            <WebSocketProvider>
              <Outlet />
            </WebSocketProvider>
          </AuthProvider>
        }
      >
        <Route path="account/*" element={<JamiMessenger />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="contacts" element={<ContactList />} />
      </Route>
      <Route path="setup" element={<ServerSetup />} />
    </Route>
  )
);

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
          <ThemeProvider theme={defaultTheme}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </SocketProvider>
      </QueryClientProvider>
    </StrictMode>
  </Provider>
);
