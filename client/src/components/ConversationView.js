import { useCallback, useContext, useEffect, useState } from 'react'
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';
import { Box, Stack, Typography } from '@mui/material';
import ConversationAvatar from './ConversationAvatar';
import { useConversationQuery, useMessagesQuery, useSendMessageMutation } from '../services/conversation';
import { SocketContext } from '../contexts/socket';

const ConversationView = props => {
  const socket = useContext(SocketContext)
  const [conversation, setConversation] = useState()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const conversationQuery = useConversationQuery(props.accountId, props.conversationId)
  const messagesQuery = useMessagesQuery(props.accountId, props.conversationId)
  const sendMessageMutation = useSendMessageMutation(props.accountId, props.conversationId)

  useEffect(() => {
    if (conversationQuery.isSuccess) {
      const conversation = Conversation.from(props.accountId, conversationQuery.data)
      setConversation(conversation)
    }
  }, [conversationQuery.data])

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      const sortedMessages = sortMessages(messagesQuery.data)
      setMessages(sortedMessages)
    }
  }, [messagesQuery.data])

  useEffect(() => {
    setIsLoading(conversationQuery.isLoading || messagesQuery.isLoading)
  }, [conversationQuery.isLoading, messagesQuery.isLoading])
  
  useEffect(() => {
    setError(conversationQuery.isError || messagesQuery.isError)
  }, [conversationQuery.isError, messagesQuery.isError])

  const sendMessage = useCallback(
    (message) => sendMessageMutation.mutate(message),
    [sendMessageMutation]
  )

  useEffect(() => {
    if (!conversation)
      return
    console.log(`io set conversation ${props.conversationId} `+ socket)
    if (socket)
      socket.emit('conversation', { accountId: props.accountId, conversationId: props.conversationId })
    socket.off('newMessage')
    socket.on('newMessage', (data) => {
      console.log("newMessage")
      setMessages(
        (messages) => addMessage(messages, data)
      )
    })
  }, [socket, setMessages])

  if (isLoading) {
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