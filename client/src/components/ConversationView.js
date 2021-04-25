import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';
import io from "socket.io-client";

const ConversationView = props => {
  const [loadingMesages, setLoadingMesages] = useState(false)
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
    return () => controller.abort()
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
    if (!loadingMesages || !state.conversation)
      return
    console.log(`Load more messages`)
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${state.conversation.getAccountId()}/conversations/${state.conversation.getId()}/messages`, {signal: controller.signal})
      .then(res => res.json())
      .then(messages => {
        console.log(messages)
        setLoadingMesages(false)
        if (state.conversation)
            state.conversation.addLoadedMessages(messages)
        setState(state)
      }).catch(e => console.log(e))
      return () => controller.abort()
  }, [state, loadingMesages])

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
  } else {
  return <div className="messenger">
      <MessageList conversation={state.conversation} loading={loadingMesages} loadMore={() => setLoadingMesages(true)} messages={state.conversation.getMessages()} />
      <SendMessageForm onSend={sendMessage} />
    </div>
  }
}

export default ConversationView