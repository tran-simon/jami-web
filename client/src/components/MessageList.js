import { Avatar, Box, Divider, Typography } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import Message from './Message'

class MessageList extends React.Component {
    render() {
        return (
            <div className="message-list">
                <Box>
                <Box style={{display:'inline-block', margin: 16, verticalAlign:'middle'}}>
                    <Avatar>{this.props.conversation.getDisplayName()[0].toUpperCase()}</Avatar>
                </Box>
                <Box style={{display:'inline-block', verticalAlign:'middle'}}>
                    <Typography variant="h5">{this.props.conversation.getDisplayName()}</Typography>
                    <Typography variant="subtitle1">{this.props.conversation.getId()}</Typography>
                    </Box>
                    </Box>
                <Divider orientation="horizontal" />
                {
                    this.props.messages.map((message, index) => {
                        /*DUMMY_DATA.map((message, index) => {*/
                        return (
                            <Message key={index} username={message.senderId} text={message.text} />
                        )
                    })}
            </div>
        )
    }
}

export default MessageList