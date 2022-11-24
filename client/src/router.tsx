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
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';

import App, { appLoader } from './App';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import AuthProvider from './contexts/AuthProvider';
import CallProvider, { CallRole, CallStatus } from './contexts/CallProvider';
import ConversationProvider from './contexts/ConversationProvider';
import WebRtcProvider from './contexts/WebRtcProvider';
import WebSocketProvider from './contexts/WebSocketProvider';
import { RouteParams } from './hooks/useUrlParams';
import NotificationManager from './managers/NotificationManager';
import AccountSettings from './pages/AccountSettings';
import CallInterface from './pages/CallInterface';
import GeneralSettings from './pages/GeneralSettings';
import Messenger from './pages/Messenger';
import Setup from './pages/Setup';
import SetupLogin from './pages/SetupLogin';
import Welcome from './pages/Welcome';
import { ThemeDemonstrator } from './themes/ThemeDemonstrator';

export type ConversationRouteParams = RouteParams<{ conversationId: string }, Record<string, never>>;

export type AddContactRouteParams = RouteParams<{ contactId: string }, Record<string, never>>;

export type CallRouteParams = RouteParams<
  { conversationId?: string },
  { role?: CallRole },
  {
    isVideoOn?: boolean;
    callStatus: CallStatus;
  }
>;

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} loader={appLoader}>
      <Route path="login" element={<Welcome />} />
      <Route path="setup/login" element={<SetupLogin />} />
      <Route path="setup" element={<Setup />} />
      <Route path="theme" element={<ThemeDemonstrator />} />
      <Route
        element={
          <AuthProvider>
            <WebSocketProvider>
              <NotificationManager>
                <Outlet />
              </NotificationManager>
            </WebSocketProvider>
          </AuthProvider>
        }
      >
        <Route index element={<Messenger />} />
        <Route path="conversation" element={<Messenger />}>
          {/* TODO: Remove this route. Adding a contact should not change the route, we should instead use an internal
                    state in the Messenger component
           */}
          <Route path="add-contact" element={<div></div>} />
          <Route
            path=":conversationId"
            element={
              <ConversationProvider>
                <Outlet />
              </ConversationProvider>
            }
          >
            <Route index element={<ConversationView />} />
            <Route
              path="call"
              element={
                <WebRtcProvider>
                  <CallProvider>
                    <CallInterface />
                  </CallProvider>
                </WebRtcProvider>
              }
            />
          </Route>
        </Route>
        <Route path="settings-account" element={<AccountSettings />} />
        <Route path="settings-general" element={<GeneralSettings />} />
        <Route path="contacts" element={<ContactList />} />
      </Route>
    </Route>
  )
);
