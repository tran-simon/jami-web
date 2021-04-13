import List from '@material-ui/core/List'
import React from 'react'
import ConversationListItem from './ConversationListItem'
import ListSubheader from '@material-ui/core/ListSubheader';
import Conversation from '../../../model/Conversation';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import { Typography } from '@material-ui/core';

class ConversationList extends React.Component {
    render() {
        console.log("ConversationList render " + this.props.accountId)
        console.log(this.props.conversations)
        return (
            <div className="rooms-list">
                <List>
                    {this.props.search instanceof Conversation &&
                    (<div>
                        <ListSubheader>Public directory</ListSubheader>
                        <ConversationListItem conversation={this.props.search} />
                    <ListSubheader>Conversations</ListSubheader>
                    </div>)}
                    {this.props.conversations.map(conversation =>
                        <ConversationListItem key={conversation.getId()} conversation={conversation} />
                    )}
                    {this.props.conversations.length === 0 && (
                        <div className="list-placeholder">
                            <GroupRoundedIcon color="disabled" fontSize="large"  />
                            <Typography className="subtitle" variant="subtitle2">No conversation yet</Typography>
                        </div>
                    )}
                </List>
            </div>
        )
    }
}

export default ConversationList