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
import { Divider, Stack } from '@mui/material';
import { Account, ConversationMember, Message } from 'jami-web-common';
import { useCallback, useContext, useEffect, useState } from 'react';

import LoadingPage from '../components/Loading';
import MessageList from '../components/MessageList';
import SendMessageForm from '../components/SendMessageForm';
import { SocketContext } from '../contexts/Socket';
import { useMessagesQuery, useSendMessageMutation } from '../services/Conversation';

type ChatInterfaceProps = {
  account: Account;
  conversationId: string;
  members: ConversationMember[];
};
const ChatInterface = ({ account, conversationId, members }: ChatInterfaceProps) => {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const messagesQuery = useMessagesQuery(account.getId(), conversationId);
  const sendMessageMutation = useSendMessageMutation(account.getId(), conversationId);

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      const sortedMessages = sortMessages(messagesQuery.data);
      setMessages(sortedMessages);
    }
  }, [messagesQuery.isSuccess, messagesQuery.data]);

  useEffect(() => {
    setIsLoading(messagesQuery.isLoading);
  }, [messagesQuery.isLoading]);

  useEffect(() => {
    setError(messagesQuery.isError);
  }, [messagesQuery.isError]);

  const sendMessage = useCallback((message: string) => sendMessageMutation.mutate(message), [sendMessageMutation]);

  useEffect(() => {
    if (socket) {
      socket.off('newMessage');
      socket.on('newMessage', (data) => {
        console.log('newMessage');
        setMessages((messages) => addMessage(messages, data));
      });
    }
  }, [conversationId, socket]);

  if (isLoading) {
    return <LoadingPage />;
  } else if (error) {
    return <div>Error loading {conversationId}</div>;
  }

  return (
    <Stack flex={1} overflow="hidden">
      <MessageList account={account} members={members} messages={messages} />
      <Divider
        sx={{
          margin: '30px 16px 0px 16px',
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <SendMessageForm account={account} members={members} onSend={sendMessage} />
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
    console.error("Can't insert message " + message.id);
    return sortedMessages;
  }
};

const sortMessages = (messages: Message[]) => {
  let sortedMessages: Message[] = [];
  messages.forEach((message) => (sortedMessages = addMessage(sortedMessages, message)));
  return sortedMessages;
};

export default ChatInterface;
