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
import { ConversationMessage, IConversation, LookupResult, WebSocketMessageType } from 'jami-web-common';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { Contact } from '../models/contact';
import { Conversation } from '../models/conversation';
import { setRefreshFromSlice } from '../redux/appSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { SetState } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { WebSocketContext } from './WebSocketProvider';

export interface IMessengerContext {
  conversations: Conversation[] | undefined;

  setSearchQuery: SetState<string | undefined>;

  searchResult: Conversation | undefined;

  newContactId: string | undefined;
  setNewContactId: SetState<string | undefined>;
}

const defaultMessengerContext: IMessengerContext = {
  conversations: undefined,
  newContactId: undefined,
  setNewContactId: () => {},
  setSearchQuery: () => {},
  searchResult: undefined,
};

export const MessengerContext = createContext<IMessengerContext>(defaultMessengerContext);

export default ({ children }: { children: ReactNode }) => {
  const { refresh } = useAppSelector((state) => state.userInfo);
  const dispatch = useAppDispatch();
  const { accountId, axiosInstance } = useAuthContext();
  const webSocket = useContext(WebSocketContext);

  const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [searchResult, setSearchResults] = useState<Conversation | undefined>(undefined);
  const [newContactId, setNewContactId] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    axiosInstance
      .get<IConversation[]>('/conversations', {
        signal: controller.signal,
      })
      .then(({ data }) => {
        setConversations(
          Object.values(data).map((conversationInterface) => Conversation.fromInterface(conversationInterface))
        );
      });
    // return () => controller.abort()
  }, [axiosInstance, accountId, refresh]);

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const conversationMessageListener = (_data: ConversationMessage) => {
      dispatch(setRefreshFromSlice());
    };

    webSocket.bind(WebSocketMessageType.ConversationMessage, conversationMessageListener);

    return () => {
      webSocket.unbind(WebSocketMessageType.ConversationMessage, conversationMessageListener);
    };
  }, [webSocket, dispatch]);

  useEffect(() => {
    if (!searchQuery) return;
    const controller = new AbortController();
    axiosInstance
      .get<LookupResult>(`/ns/username/${searchQuery}`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        const contact = new Contact(data.address, data.username);
        setSearchResults(contact ? Conversation.fromSingleContact(contact) : undefined);
      })
      .catch(() => {
        setSearchResults(undefined);
      });
    // return () => controller.abort() // crash on React18
  }, [accountId, searchQuery, axiosInstance]);

  const value = useMemo(
    () => ({
      conversations,
      setSearchQuery,
      searchResult,
      newContactId,
      setNewContactId,
    }),
    [conversations, setSearchQuery, searchResult, newContactId, setNewContactId]
  );

  return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
};
