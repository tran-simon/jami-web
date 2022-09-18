import List from '@mui/material/List'
import { useEffect } from "react";
import ConversationListItem from './ConversationListItem'
import ListSubheader from '@mui/material/ListSubheader';
import Conversation from '../../../model/Conversation';
import { GroupRounded as GroupIcon } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '../../redux/hooks';

export default function ConversationList(props) {
    const { refresh } = useAppSelector((state) => state.app)

    useEffect(() => {
      console.log("refresh list");
    }, [refresh])

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
