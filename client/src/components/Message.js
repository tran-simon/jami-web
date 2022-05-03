import { Typography } from '@mui/material'
import { GroupOutlined } from '@mui/icons-material'
import React from 'react'
import ConversationAvatar from './ConversationAvatar'

function Message(props) {
    const message = props.message
    if (message.type == 'text/plain')
        return (<div className="message">
            <div className="message-avatar">
                <ConversationAvatar name={message.author} /></div>
            <Typography className="message-text">{message.body}</Typography>
        </div>)
    else if (message.type == 'contact')
        return (<div className="contact-event">
            <Typography className="message-text">Contact event</Typography>
        </div>)
    else if (message.type == 'initial')
        return (<div className="conversation-event">
            <Typography variant="h6" className="message-text" color="textSecondary">
                <div className="inline-avatar"><GroupOutlined color="action" style={{ fontSize: 32 }} /></div>Conversation created
                </Typography>
        </div>)
    else return ''
}

export default Message