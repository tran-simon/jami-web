import React from 'react'
import Message from './Message'


class MessageList extends React.Component {
    render() {
        return (
            <div className="message-list">

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