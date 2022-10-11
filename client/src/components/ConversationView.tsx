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
import { Box, Stack, Typography } from '@mui/material';
import { Conversation, Message } from 'jami-web-common';
import { useCallback, useContext, useEffect, useState } from 'react';

import { SocketContext } from '../contexts/Socket';
import { useConversationQuery, useMessagesQuery, useSendMessageMutation } from '../services/Conversation';
import ConversationAvatar from './ConversationAvatar';
import LoadingPage from './Loading';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';

type ConversationViewProps = {
  accountId: string;
  conversationId: string;
};
const ConversationView = ({ accountId, conversationId, ...props }: ConversationViewProps) => {
  const socket = useContext(SocketContext);
  const [conversation, setConversation] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const conversationQuery = useConversationQuery(accountId, conversationId);
  const messagesQuery = useMessagesQuery(accountId, conversationId);
  const sendMessageMutation = useSendMessageMutation(accountId, conversationId);

  useEffect(() => {
    if (conversationQuery.isSuccess) {
      const conversation = Conversation.from(accountId, conversationQuery.data);
      setConversation(conversation);
    }
  }, [accountId, conversationQuery.isSuccess, conversationQuery.data]);

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      const sortedMessages = sortMessages(messagesQuery.data);
      setMessages(sortedMessages);
    }
  }, [messagesQuery.isSuccess, messagesQuery.data]);

  useEffect(() => {
    setIsLoading(conversationQuery.isLoading || messagesQuery.isLoading);
  }, [conversationQuery.isLoading, messagesQuery.isLoading]);

  useEffect(() => {
    setError(conversationQuery.isError || messagesQuery.isError);
  }, [conversationQuery.isError, messagesQuery.isError]);

  const sendMessage = useCallback((message: string) => sendMessageMutation.mutate(message), [sendMessageMutation]);

  useEffect(() => {
    if (!conversation) return;
    console.log(`io set conversation ${conversationId} ` + socket);
    if (socket) {
      socket.emit('conversation', {
        accountId,
        conversationId,
      });
      socket.off('newMessage');
      socket.on('newMessage', (data) => {
        console.log('newMessage');
        setMessages((messages) => addMessage(messages, data));
      });
    }
  }, [accountId, conversation, conversationId, socket]);

  if (isLoading) {
    return <LoadingPage />;
  } else if (error) {
    return <div>Error loading {conversationId}</div>;
  }

  return (
    <Stack flexGrow={1} height="100%">
      <Stack direction="row" flexGrow={0}>
        <Box style={{ margin: 16, flexShrink: 0 }}>
          <ConversationAvatar displayName={conversation?.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ flex: '1 1 auto', overflow: 'hidden' }}>
          <Typography className="title" variant="h6">
            {conversation?.getDisplayName()}
          </Typography>
          <Typography className="subtitle" variant="subtitle1">
            {conversationId}
          </Typography>
        </Box>
      </Stack>
      <Stack flexGrow={1} overflow="auto" direction="column-reverse">
        <MessageList messages={messages} />
      </Stack>
      <Stack flexGrow={0}>
        <SendMessageForm onSend={sendMessage} />
      </Stack>
    </Stack>
  );
};

const addMessage = (sortedMessages: Message[], message: Message) => {
  if (sortedMessages.length === 0) {
    return [message];
  } else if (message.id === sortedMessages[sortedMessages.length - 1].linearizedParent) {
    return [...sortedMessages, message];
  } else if (message.linearizedParent === sortedMessages[0].id) {
    return [message, ...sortedMessages];
  } else {
    console.log("Can't insert message " + message.id);
    return sortedMessages;
  }
};

const sortMessages = (messages: Message[]) => {
  let sortedMessages: Message[] = [];
  messages.forEach((message) => (sortedMessages = addMessage(sortedMessages, message)));
  return sortedMessages;
};

export default ConversationView;
