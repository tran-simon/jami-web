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
import { CallAction, Conversation, ConversationView, WebSocketMessageType } from 'jami-web-common';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LoadingPage from '../components/Loading';
import { useUrlParams } from '../hooks/useUrlParams';
import { ConversationRouteParams } from '../router';
import { useConversationQuery } from '../services/Conversation';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IConversationProvider {
  conversationId: string;
  conversation: Conversation;

  beginCall: () => void;
}

export const ConversationContext = createContext<IConversationProvider>(undefined!);

export default ({ children }: WithChildren) => {
  const {
    urlParams: { conversationId },
  } = useUrlParams<ConversationRouteParams>();
  const { accountId } = useAuthContext();
  const webSocket = useContext(WebSocketContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [conversation, setConversation] = useState<Conversation | undefined>();
  const navigate = useNavigate();

  const conversationQuery = useConversationQuery(conversationId);

  useEffect(() => {
    if (conversationQuery.isSuccess) {
      const conversation = Conversation.from(accountId, conversationQuery.data);
      setConversation(conversation);
    }
  }, [accountId, conversationQuery.isSuccess, conversationQuery.data]);

  useEffect(() => {
    setIsLoading(conversationQuery.isLoading);
  }, [conversationQuery.isLoading]);

  useEffect(() => {
    setIsError(conversationQuery.isError);
  }, [conversationQuery.isError]);

  const beginCall = useCallback(() => {
    if (!webSocket || !conversation) {
      throw new Error('Could not begin call');
    }

    // TODO: Could we move this logic to the server? The client could make a single request with the conversationId,
    // and the server is tasked with sending all the individual requests to the members of the conversation
    for (const member of conversation.getMembers()) {
      const callBegin: CallAction = {
        contactId: member.contact.getUri(),
        conversationId,
      };

      console.info('Sending CallBegin', callBegin);
      webSocket.send(WebSocketMessageType.CallBegin, callBegin);
    }

    navigate(`/conversation/${conversationId}/call?role=caller`);
  }, [conversationId, webSocket, conversation, navigate]);

  useEffect(() => {
    if (!conversation || !webSocket) {
      return;
    }

    const conversationView: ConversationView = {
      conversationId,
    };

    webSocket.send(WebSocketMessageType.ConversationView, conversationView);
  }, [accountId, conversation, conversationId, webSocket]);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError || !conversation || !conversationId) {
    return <div>Error loading conversation: {conversationId}</div>;
  }

  return (
    <ConversationContext.Provider
      value={{
        conversationId,
        conversation,
        beginCall,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
