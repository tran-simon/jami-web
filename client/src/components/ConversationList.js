import List from '@material-ui/core/List'
import React from 'react'
import ConversationListItem from './ConversationListItem'

class ConversationList extends React.Component {
    render() {

        return (
            <List>
                {this.props.conversations.forEach(conversation => {
                    <ConversationListItem conversation={conversation} />
                })}
            </List>
        )
    }
}

export default ConversationList