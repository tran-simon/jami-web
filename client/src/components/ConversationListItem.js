import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import React from 'react'
import Conversation from '../../../model/Conversation'
import { useHistory, useParams } from "react-router-dom"
import ConversationAvatar from './ConversationAvatar'

export default function ConversationListItem(props) {
    const { conversationId, contactId } = useParams()
    const conversation = props.conversation
    const pathId = conversationId || contactId
    const isSelected = conversation.getDisplayUri() === pathId
    const history = useHistory()

    const uri = conversation.getId() ? `conversation/${conversation.getId()}` : `addContact/${conversation.getFirstMember().contact.getUri()}`
    if (conversation instanceof Conversation) {
        return (
            <ListItem
                button
                alignItems="flex-start"
                selected={isSelected}
                style={{overflow:'hidden'}}
                onClick={() => history.replace(`/account/${conversation.getAccountId()}/${uri}`)}>
                <ListItemAvatar><ConversationAvatar displayName={conversation.getDisplayNameNoFallback()} /></ListItemAvatar>
                <ListItemText
                    style={{overflow:'hidden', textOverflow:'ellipsis'}}
                    primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
            </ListItem>
        )
    } else
        return null
}
