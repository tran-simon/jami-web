import { Typography } from '@material-ui/core'
import React from 'react'

function Message(props) {
    console.log("Message render")
    console.log(props.message)

    return (
        <div className="message">
            <div className="message-username">{props.message.author}</div>
            <Typography className="message-text">{props.message.body}</Typography>
        </div>
    )
}

export default Message