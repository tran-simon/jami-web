import List from '@material-ui/core/List'
import React from 'react'
import ConversationListItem from './ConversationListItem'
import ListSubheader from '@material-ui/core/ListSubheader';
import Conversation from '../../../model/Conversation';
import { GroupRounded as GroupIcon } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';

export default function ConversationList(props) {
    return (
        <div className="rooms-list">
            <List>
                {props.search instanceof Conversation &&
                (<div>
                    <ListSubheader>Public directory</ListSubheader>
                    <ConversationListItem conversation={props.search} />
                    <ListSubheader>Conversations</ListSubheader>
                </div>)}
                {props.conversations.map(conversation =>
                    <ConversationListItem key={conversation.getId()} conversation={conversation} />
                )}
                {props.conversations.length === 0 && (
                    <div className="list-placeholder">
                        <GroupIcon color="disabled" fontSize="large"  />
                        <Typography className="subtitle" variant="subtitle2">No conversation yet</Typography>
                    </div>
                )}
            </List>
        </div>
    )
}
