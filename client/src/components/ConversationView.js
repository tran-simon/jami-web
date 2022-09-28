import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';

import Conversation from '../../../model/Conversation';
import { SocketContext } from '../contexts/socket';
import { useConversationQuery, useMessagesQuery, useSendMessageMutation } from '../services/conversation';
import ConversationAvatar from './ConversationAvatar';
import LoadingPage from './loading';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';

const ConversationView = ({ accountId, conversationId, ...props }) => {
  const socket = useContext(SocketContext);
  const [conversation, setConversation] = useState();
  const [messages, setMessages] = useState([]);
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

  const sendMessage = useCallback((message) => sendMessageMutation.mutate(message), [sendMessageMutation]);

  useEffect(() => {
    if (!conversation) return;
    console.log(`io set conversation ${conversationId} ` + socket);
    if (socket) socket.emit('conversation', { accountId, conversationId });
    socket.off('newMessage');
    socket.on('newMessage', (data) => {
      console.log('newMessage');
      setMessages((messages) => addMessage(messages, data));
    });
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

const addMessage = (sortedMessages, message) => {
  if (sortedMessages.length === 0) {
    return [message];
  } else if (message.id === sortedMessages[sortedMessages.length - 1].linearizedParent) {
    return [...sortedMessages, message];
  } else if (message.linearizedParent === sortedMessages[0].id) {
    return [message, ...sortedMessages];
  } else {
    console.log("Can't insert message " + message.id);
  }
};

const sortMessages = (messages) => {
  let sortedMessages = [];
  messages.forEach((message) => (sortedMessages = addMessage(sortedMessages, message)));
  return sortedMessages;
};

export default ConversationView;
