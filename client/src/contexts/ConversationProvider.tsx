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
import { ConversationView, WebSocketMessageType } from 'jami-web-common';
import { useContext, useEffect } from 'react';

import LoadingPage from '../components/Loading';
import { createOptionalContext } from '../hooks/createOptionalContext';
import { useUrlParams } from '../hooks/useUrlParams';
import { Conversation } from '../models/conversation';
import { ConversationRouteParams } from '../router';
import { useConversationQuery } from '../services/conversationQueries';
import { WithChildren } from '../utils/utils';
import { useAuthContext } from './AuthProvider';
import { WebSocketContext } from './WebSocketProvider';

interface IConversationContext {
  conversationId: string;
  conversation: Conversation;
}

const optionalConversationContext = createOptionalContext<IConversationContext>('ConversationContext');
const ConversationContext = optionalConversationContext.Context;
export const useConversationContext = optionalConversationContext.useOptionalContext;

export default ({ children }: WithChildren) => {
  const {
    urlParams: { conversationId },
  } = useUrlParams<ConversationRouteParams>();
  const { accountId } = useAuthContext();
  const webSocket = useContext(WebSocketContext);

  const { conversation, isLoading, isError } = useConversationQuery(conversationId!);

  useEffect(() => {
    if (!conversation || !conversationId || !webSocket) {
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
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
