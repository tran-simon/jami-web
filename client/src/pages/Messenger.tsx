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
import { Stack } from '@mui/material';
import { Contact, Conversation } from 'jami-web-common';
import { useEffect, useState } from 'react';

//import Sound from 'react-sound';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView';
import Header from '../components/Header';
import LoadingPage from '../components/Loading';
import NewContactForm from '../components/NewContactForm';
import { useAuthContext } from '../contexts/AuthProvider';
import { useAppSelector } from '../redux/hooks';
import { MessengerRouteParams } from '../router';
import { useUrlParams } from '../utils/hooks';
import AddContactPage from './AddContactPage';

const Messenger = () => {
  const { refresh } = useAppSelector((state) => state.userInfo);
  const { account, axiosInstance } = useAuthContext();

  const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResults] = useState<Conversation | undefined>(undefined);

  const {
    urlParams: { conversationId, contactId },
  } = useUrlParams<MessengerRouteParams>();

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
    <Stack direction="row" height="100vh" width="100vw">
      <Stack flexGrow={0} flexShrink={0} overflow="auto">
        <Header />
        <NewContactForm onChange={setSearchQuery} />
        {contactId && <AddContactPage contactId={contactId} />}
        {conversations ? (
          <ConversationList search={searchResult} conversations={conversations} accountId={accountId} />
        ) : (
          <div className="rooms-list">
            <LoadingPage />
          </div>
        )}
      </Stack>
      <Stack flexGrow={1}>{conversationId && <ConversationView conversationId={conversationId} />}</Stack>
    </Stack>
  );
};

export default Messenger;
