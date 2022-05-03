import Message from './Message'
import React, { useEffect } from 'react'
import { Box, Divider, Typography } from '@mui/material'
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
        <Box style={{ margin: 16, flexShrink: 0 }}>
          <ConversationAvatar displayName={props.conversation.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ flex: "1 1 auto", overflow: 'hidden' }}>
          <Typography className="title" variant="h6">{displayName}</Typography>
          <Typography className="subtitle" variant="subtitle1" >{props.conversation.getId()}</Typography>
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