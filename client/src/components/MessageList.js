import Message from './Message'
import React from 'react'
import { Box, Divider, Typography } from '@material-ui/core'
import ConversationAvatar from './ConversationAvatar'

export default function MessageList(props) {
  const displayName = props.conversation.getDisplayName()

  return (
    <div className="message-list">
      <Box>
        <Box style={{ display: 'inline-block', margin: 16, verticalAlign: 'middle' }}>
          <ConversationAvatar displayName={props.conversation.getDisplayNameNoFallback()} />
        </Box>
        <Box style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <Typography variant="h6">{displayName}</Typography>
          <Typography variant="subtitle1">{props.conversation.getId()}</Typography>
        </Box>
      </Box>
      <Divider orientation="horizontal" />
      {props.messages.map((message, index) =>
        <Message key={index} username={message.senderId} text={message.text} />
      )}
    </div>
  )
}