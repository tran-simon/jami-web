/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { GroupRounded as GroupIcon } from '@mui/icons-material';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';

import Conversation from '../../../model/Conversation';
import { useAppSelector } from '../../redux/hooks';
import ConversationListItem from './ConversationListItem';

type ConversationListProps = {
  accountId: string;
  conversations: Conversation[];
  search?: Conversation;
};
export default function ConversationList(props: ConversationListProps) {
  const { refresh } = useAppSelector((state) => state.app);

  useEffect(() => {
    console.log('refresh list');
  }, [refresh]);

  return (
    <div className="rooms-list">
      <List>
        {props.search instanceof Conversation && (
          <div>
            <ListSubheader>Public directory</ListSubheader>
            <ConversationListItem conversation={props.search} />
            <ListSubheader>Conversations</ListSubheader>
          </div>
        )}
        {props.conversations.map((conversation) => (
          <ConversationListItem key={conversation.getId()} conversation={conversation} />
        ))}
        {props.conversations.length === 0 && (
          <div className="list-placeholder">
            <GroupIcon color="disabled" fontSize="large" />
            <Typography className="subtitle" variant="subtitle2">
              No conversation yet
            </Typography>
          </div>
        )}
      </List>
    </div>
  );
}
