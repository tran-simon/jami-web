import Message from './Message'
import React, { useEffect } from 'react'
import { Box, Divider, Typography } from '@material-ui/core'
import ConversationAvatar from './ConversationAvatar'

export default function MessageList(props) {
  const displayName = props.conversation.getDisplayName()
  const messages = props.conversation.getMessages()

  useEffect(() => {
    if (!props.loading)
      props.loadMore()
  }, [props.conversation.getId()])

  return (
    <React.Fragment>
      <Box className="conversation-header">
        <Box style={{ display: 'inline-block', margin: 16, verticalAlign: 'middle' }}>
          <ConversationAvatar displayName={props.conversation.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <Typography variant="h6">{displayName}</Typography>
          <Typography variant="subtitle1">{props.conversation.getId()}</Typography>
        </Box>
        <Divider orientation="horizontal" />
      </Box>
      <div className="message-list">
        {messages.map((message) => <Message key={message.id} message={message} />)}
        <div style={{ border: "1px solid transparent" }}/>
      </div>
    </React.Fragment>
  )
}