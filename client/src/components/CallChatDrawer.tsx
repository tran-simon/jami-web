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
import { Divider, Stack, Typography } from '@mui/material';
import { useContext } from 'react';

import { CallContext } from '../contexts/CallProvider';
import { ConversationContext } from '../contexts/ConversationProvider';
import ChatInterface from '../pages/ChatInterface';
import { CloseButton } from './Button';

export default () => {
  return (
    <Stack
      width="33%"
      height="100%"
      sx={{
        backgroundColor: 'white',
      }}
    >
      <CallChatDrawerHeader />
      <Divider
        sx={{
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <ChatInterface />
    </Stack>
  );
};

const CallChatDrawerHeader = () => {
  const { setIsChatShown } = useContext(CallContext);
  const { conversation } = useContext(ConversationContext);

  // TODO: Improve this to support multiple members
  const contact = conversation.getFirstMember().contact;

  return (
    <Stack direction="row" padding={2} spacing={2} alignItems="center">
      <CloseButton
        onClick={() => {
          setIsChatShown(false);
        }}
      />
      <Stack direction="column">
        <Typography variant="h3" textOverflow="ellipsis">
          {contact.getDisplayName()}
        </Typography>
      </Stack>
    </Stack>
  );
};
