import { Avatar, Box, Divider, Typography } from '@material-ui/core'
import React from 'react'
import Message from './Message'
import PersonIcon from '@material-ui/icons/PersonRounded'

export default function MessageList(props) {
    const displayName = props.conversation.getDisplayName()

    return (
        <div className="message-list">
            <Box>
                <Box style={{ display: 'inline-block', margin: 16, verticalAlign: 'middle' }}>
                    <Avatar>{displayName ? displayName[0].toUpperCase() : <PersonIcon />}</Avatar>
                </Box>
                <Box style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <Typography variant="h5">{displayName}</Typography>
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