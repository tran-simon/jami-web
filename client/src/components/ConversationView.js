import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';
import io from "socket.io-client";
import { Box, Stack, Typography } from '@mui/material';
import ConversationAvatar from './ConversationAvatar';

const ConversationView = props => {
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [socket, setSocket] = useState(undefined)
  const [state, setState] = useState({
    loaded: false,
    error: false,
    conversation: undefined
  })

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${props.accountId}/conversations/${props.conversationId}`, {signal: controller.signal})
    .then(res => res.json())
    .then(result => {
      console.log(result)
      setState({
        loaded: true,
        conversation: Conversation.from(props.accountId, result)
      })
    }, error => {
      console.log(`get error ${error}`)
      setState({
        loaded: true,
        error: true
      })
    })
   // return () => controller.abort() // crash on React18
  }, [props.accountId, props.conversationId])

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
    if (!state.conversation)
      return
    console.log(`io set conversation ${state.conversation.getId()} `+ socket)
    if (socket)
      socket.emit('conversation', { accountId: state.conversation.getAccountId(), conversationId: state.conversation.getId() })
    socket.off('newMessage')
    socket.on('newMessage', (data) => {
      console.log("newMessage")
      console.log(data)
      setState(state => {
        if (state.conversation)
          state.conversation.addMessage(data)
        return {...state}
      })
    })
  }, [state.conversation ? state.conversation.getId() : "", socket])

  useEffect(() => {
    if (!loadingMessages || !state.conversation)
      return
    console.log(`Load more messages`)
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${state.conversation.getAccountId()}/conversations/${state.conversation.getId()}/messages`, {signal: controller.signal})
      .then(res => res.json())
      .then(messages => {
        console.log(messages)
        setLoadingMessages(false)
        setState(state => {
          if (state.conversation)
            state.conversation.addLoadedMessages(messages)
            return {...state}
          })
      }).catch(e => console.log(e))
     // return () => controller.abort() // crash on React18
  }, [state, loadingMessages])

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

  if (state.loaded === false) {
      return <LoadingPage />
  } else if (state.error === true) {
      return <div>Error loding {props.conversationId}</div>
  }

  return (
    <Stack
      flexGrow={1}
      height="100%"
    >
      <Stack direction="row" flexGrow={0}>
        <Box style={{ margin: 16, flexShrink: 0 }}>
          <ConversationAvatar displayName={state.conversation.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ flex: "1 1 auto", overflow: 'hidden' }}>
          <Typography className="title" variant="h6">{state.conversation.getDisplayName()}</Typography>
          <Typography className="subtitle" variant="subtitle1" >{state.conversation.getId()}</Typography>
        </Box>
      </Stack>
      <Stack flexGrow={1} overflow="auto" direction="column-reverse">
        <MessageList
          conversationId={state.conversation.getId()}
          loading={loadingMessages} 
          loadMore={() => setLoadingMessages(true)}
          messages={state.conversation.getMessages()}
        />
      </Stack>
      <Stack flexGrow={0}>
        <SendMessageForm onSend={sendMessage} />
      </Stack>
    </Stack>
  )
}

export default ConversationView