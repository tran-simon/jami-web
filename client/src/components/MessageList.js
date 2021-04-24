import Message from './Message'
import React, { useEffect } from 'react'
import { Box, Divider, Typography } from '@material-ui/core'
import ConversationAvatar from './ConversationAvatar'
const reverseMap = (arr, f) => arr.map((_, idx, arr) => f(arr[arr.length - 1 - idx ]));

export default function MessageList(props) {
  const displayName = props.conversation.getDisplayName()
  const messages = props.conversation.getMessages()
  console.log("MessageList render " + messages.length)

  useEffect(() => {
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
      <div className="message-list-inner">
      {reverseMap(messages, (message) => <Message key={message.id} message={message} />)}
      </div>
      </div>
    </React.Fragment>
  )
}