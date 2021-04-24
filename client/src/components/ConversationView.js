import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';

const ConversationView = props => {
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
        conversation: Conversation.from(props.accountId, result)// result.map(account => Account.from(account)),
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

  const loadMore = () => {
    authManager.fetch(`/api/accounts/${props.accountId}/conversations/${props.conversationId}/messages`)
      .then(res => res.json())
      .then(messages => {
        console.log(messages)
        state.conversation.addLoadedMessages(messages)
        setState(state)
      })
  }

  console.log("ConversationView render " + (state.conversation ? state.conversation.getMessages().length : "no conversation"))
  if (state.loaded === false) {
      return <LoadingPage />
  } else if (state.error === true) {
      return <div>Error loding {props.conversationId}</div>
  } else {
  return <div className="messenger">
      <MessageList conversation={state.conversation} loadMore={loadMore} messages={state.conversation.getMessages()} />
      <SendMessageForm onSend={sendMessage} />
    </div>
  }
}

export default ConversationView