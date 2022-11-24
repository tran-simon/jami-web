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
import { Box, Stack } from '@mui/material';
import { Contact, Conversation, WebSocketMessageType } from 'jami-web-common';
import { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

//import Sound from 'react-sound';
import ConversationList from '../components/ConversationList';
import Header from '../components/Header';
import LoadingPage from '../components/Loading';
import NewContactForm from '../components/NewContactForm';
import { useAuthContext } from '../contexts/AuthProvider';
import { WebSocketContext } from '../contexts/WebSocketProvider';
import { useUrlParams } from '../hooks/useUrlParams';
import { setRefreshFromSlice } from '../redux/appSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { AddContactRouteParams } from '../router';
import AddContactPage from './AddContactPage';

const Messenger = () => {
  const { refresh } = useAppSelector((state) => state.userInfo);
  const dispatch = useAppDispatch();
  const { account, axiosInstance } = useAuthContext();
  const webSocket = useContext(WebSocketContext);

  const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResults] = useState<Conversation | undefined>(undefined);

  const { urlParams } = useUrlParams<AddContactRouteParams>();

  const newContactId = urlParams?.contactId; // TODO: Rework this logic (https://git.jami.net/savoirfairelinux/jami-web/-/issues/171)

  const accountId = account.getId();

  useEffect(() => {
    const controller = new AbortController();
    axiosInstance
      .get<Conversation[]>('/conversations', {
        signal: controller.signal,
      })
      .then(({ data }) => {
        setConversations(Object.values(data).map((c) => Conversation.from(accountId, c)));
      });
    // return () => controller.abort()
  }, [axiosInstance, accountId, refresh]);

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const conversationMessageListener = () => dispatch(setRefreshFromSlice());
    webSocket.bind(WebSocketMessageType.ConversationMessage, conversationMessageListener);
    return () => webSocket.unbind(WebSocketMessageType.ConversationMessage, conversationMessageListener);
  }, [webSocket, dispatch]);

  useEffect(() => {
    if (!searchQuery) return;
    const controller = new AbortController();
    // TODO: Type properly https://git.jami.net/savoirfairelinux/jami-web/-/issues/92
    axiosInstance
      .get<{ state: number; address: string; username: string }>(`/ns/username/${searchQuery}`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        const contact = new Contact(data.address);
        contact.setRegisteredName(data.username);
        setSearchResults(contact ? Conversation.fromSingleContact(accountId, contact) : undefined);
      })
      .catch(() => {
        setSearchResults(undefined);
      });
    // return () => controller.abort() // crash on React18
  }, [accountId, searchQuery, axiosInstance]);

  return (
    <Box display="flex" height="100%">
      <Stack flexGrow={0} flexShrink={0} overflow="auto">
        <Header />
        <NewContactForm onChange={setSearchQuery} />
        {newContactId && <AddContactPage contactId={newContactId} />}
        {conversations ? (
          <ConversationList search={searchResult} conversations={conversations} accountId={accountId} />
        ) : (
          <div className="rooms-list">
            <LoadingPage />
          </div>
        )}
      </Stack>
      <Box flexGrow={1} display="flex" position="relative">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Messenger;
