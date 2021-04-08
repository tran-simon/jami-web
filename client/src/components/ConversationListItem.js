import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import React from 'react'

class ConversationListItem extends React.Component {
    render() {

        return (
            <ListItem alignItems="flex-start">
                <ListItemAvatar><Avatar>{this.props.conversation.getDisplayName()[0]}</Avatar></ListItemAvatar>
                <ListItemText primary={this.props.conversation.getDisplayName()} />
            </ListItem>
        )
    }
}

export default ConversationListItem