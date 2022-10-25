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
import { Stack } from '@mui/system';
import { Account, ConversationMember, Message } from 'jami-web-common';

import { MessageRow } from './Message';

interface MessageListProps {
  account: Account;
  members: ConversationMember[];
  messages: Message[];
}

export default function MessageList({ account, members, messages }: MessageListProps) {
  return (
    <Stack direction="column-reverse">
      {
        // most recent messages first
        messages.map((message, index) => {
          const isAccountMessage = message.author === account.getUri();
          let author;
          if (isAccountMessage) {
            author = account;
          } else {
            const member = members.find((member) => message.author === member.contact.getUri());
            author = member?.contact;
          }
          if (!author) {
            return null;
          }
          const props = {
            messageIndex: index,
            messages,
            isAccountMessage,
            author,
          };
          return <MessageRow key={message.id} {...props} />;
        })
      }
    </Stack>
  );
}
