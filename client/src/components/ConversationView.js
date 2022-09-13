import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';
import io from "socket.io-client";
import { Box, Stack, Typography } from '@mui/material';
import ConversationAvatar from './ConversationAvatar';
import { useConversationQuery, useMessagesQuery } from '../services/conversation';

const ConversationView = props => {
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [socket, setSocket] = useState()
  const [conversation, setConversation] = useState()
  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(true)
  const [error, setError] = useState(false)

  const conversationQuery = useConversationQuery(props.accountId, props.conversationId)
  const messagesQuery = useMessagesQuery(props.accountId, props.conversationId)

  useEffect(() => {
    if (conversationQuery.data) {
      const conversation = Conversation.from(props.accountId, conversationQuery.data)
      setConversation(conversation)
    }
  }, [conversationQuery.data])

  useEffect(() => {
    if (messagesQuery.data) {
      const sortedMessages = sortMessages(messagesQuery.data)
      setMessages(sortedMessages)
    }
  }, [messagesQuery.data])

  useEffect(() => {
    setLoaded(!(conversationQuery.isLoading || messagesQuery.isLoading))
  }, [conversationQuery.isLoading, messagesQuery.isLoading])
  
  useEffect(() => {
    setError(conversationQuery.isError || messagesQuery.isError)
  }, [conversationQuery.isError, messagesQuery.isError])

  useEffect(() => {
    console.log("io.connect")
    const socket = io()
    setSocket(socket)
    return () => {
      console.log("io.disconnect")
      socket.disconnect()
      setSocket(undefined)
    }
  }, [])

  useEffect(() => {
    if (!conversation)
      return
    console.log(`io set conversation ${props.conversationId} `+ socket)
    if (socket)
      socket.emit('conversation', { accountId: props.accountId, conversationId: props.conversationId })
    socket.off('newMessage')
    socket.on('newMessage', (data) => {
      console.log("newMessage")
      console.log(data)
      setMessages(addMessage(messages, data))
    })
  }, [conversation ? props.conversationId : "", socket])

  const sendMessage = (message) => {
    authManager.fetch(`/api/accounts/${props.accountId}/conversations/${props.conversationId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method:"POST",
      body: JSON.stringify({ message })
    })
  }

  if (!loaded) {
      return <LoadingPage />
  } else if (error) {
      return <div>Error loading {props.conversationId}</div>
  }

  return (
    <Stack
      flexGrow={1}
      height="100%"
    >
      <Stack direction="row" flexGrow={0}>
        <Box style={{ margin: 16, flexShrink: 0 }}>
          <ConversationAvatar displayName={conversation?.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ flex: "1 1 auto", overflow: 'hidden' }}>
          <Typography className="title" variant="h6">{conversation?.getDisplayName()}</Typography>
          <Typography className="subtitle" variant="subtitle1" >{props.conversationId}</Typography>
        </Box>
      </Stack>
      <Stack flexGrow={1} overflow="auto" direction="column-reverse">
        <MessageList
          conversationId={props.conversationId}
          loading={loadingMessages} 
          loadMore={() => setLoadingMessages(true)}
          messages={messages}
        />
      </Stack>
      <Stack flexGrow={0}>
        <SendMessageForm onSend={sendMessage} />
      </Stack>
    </Stack>
  )
}

const addMessage = (sortedMessages, message) => {
  if (sortedMessages.length === 0) {
    return [message]
  } else if (message.id === sortedMessages[sortedMessages.length - 1].linearizedParent) {
    return [...sortedMessages, message]
  } else if (message.linearizedParent === sortedMessages[0].id) {
    return [message, ...sortedMessages]
  } else {
    console.log("Can't insert message " + message.id)
  }
}

const sortMessages = (messages) => {
  let sortedMessages = []
  messages.forEach(message => sortedMessages = addMessage(sortedMessages, message))
  return sortedMessages
}

export default ConversationView