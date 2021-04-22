import { Typography } from '@material-ui/core'
import React from 'react'

function Message(props) {
    return (
        <div className="message">
            <div className="message-username">{props.username}</div>
            <Typography className="message-text">{props.text}</Typography>
        </div>
    )
}

export default Message