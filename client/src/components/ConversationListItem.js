import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import React from 'react'
import Conversation from '../../../model/Conversation'
import { withRouter } from 'react-router-dom';

class ConversationListItem extends React.Component {
    render() {
        const conversation = this.props.conversation;
        const pathId = this.props.match.params.conversationId || this.props.match.params.contactId
        const isSelected = conversation.getDisplayUri() === pathId
        console.log("ConversationListItem render " + conversation)
        console.log(this.props)

        const uri = conversation.getId() ? `conversation/${conversation.getId()}` : `addContact/${conversation.getFirstMember().contact.getUri()}`;
        if (conversation instanceof Conversation) {
            return (
                <ListItem
                    button
                    alignItems="flex-start"
                    selected={isSelected}
                    style={{overflow:'hidden'}}
                    onClick={() => this.props.history.push(`/account/${conversation.getAccountId()}/${uri}`)}>
                    <ListItemAvatar><Avatar>{conversation.getDisplayName()[0].toUpperCase()}</Avatar></ListItemAvatar>
                    <ListItemText
                        style={{overflow:'hidden', textOverflow:'ellipsis'}}
                        primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
                </ListItem>
            )
        } else
            return null
    }
}

export default withRouter(ConversationListItem)