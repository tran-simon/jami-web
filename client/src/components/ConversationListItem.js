import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import React from 'react'
import Conversation from '../../../model/Conversation'
import { useHistory, useParams } from "react-router-dom"
import PersonIcon from '@material-ui/icons/PersonRounded'

export default function ConversationListItem(props) {
    const { conversationId, contactId } = useParams()
    const conversation = props.conversation
    const pathId = conversationId || contactId
    const isSelected = conversation.getDisplayUri() === pathId
    const displayName = conversation.getDisplayName()
    const history = useHistory()

    const uri = conversation.getId() ? `conversation/${conversation.getId()}` : `addContact/${conversation.getFirstMember().contact.getUri()}`
    if (conversation instanceof Conversation) {
        return (
            <ListItem
                button
                alignItems="flex-start"
                selected={isSelected}
                style={{overflow:'hidden'}}
                onClick={() => history.push(`/account/${conversation.getAccountId()}/${uri}`)}>
                <ListItemAvatar>
                    <Avatar>{displayName ? displayName[0].toUpperCase() : <PersonIcon />}</Avatar>
                </ListItemAvatar>
                <ListItemText
                    style={{overflow:'hidden', textOverflow:'ellipsis'}}
                    primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
            </ListItem>
        )
    } else
        return null
}