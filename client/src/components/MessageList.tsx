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
import dayjs, { Dayjs } from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import { Account, ConversationMember, Message } from 'jami-web-common';
import { ReactNode, useMemo } from 'react';

import {
  MessageBubblesGroup,
  MessageCall,
  MessageDate,
  MessageInitial,
  MessageMember,
  MessageMerge,
  MessageTime,
} from './Message';

dayjs.extend(dayOfYear);
dayjs.extend(isBetween);

interface MessageListProps {
  account: Account;
  members: ConversationMember[];
  messages: Message[];
}

export default function MessageList({ account, members, messages }: MessageListProps) {
  const messageComponents = useMemo(() => buildMessagesList(account, members, messages), [account, members, messages]);
  return <Stack direction="column-reverse">{messageComponents}</Stack>;
}

const buildMessagesList = (account: Account, members: ConversationMember[], messages: Message[]) => {
  if (messages.length === 0) {
    return [];
  }

  const messageComponents: ReactNode[] = [];
  let lastTime = dayjs.unix(Number(messages[0].timestamp));
  let lastAuthor = messages[0].author;
  let messagesGroup: Message[] = [];

  const pushMessageBubblesGroup = () => {
    if (messagesGroup.length === 0) {
      return;
    }
    const props = { account, members, messages: messagesGroup };
    messageComponents.push(<MessageBubblesGroup key={`group-${messagesGroup[0].id}`} {...props} />);
    messagesGroup = [];
  };

  const pushMessageCall = (message: Message) => {
    const props = { message };
    messageComponents.push(<MessageCall key={`call-${message.id}`} {...props} />);
  };

  const pushMessageMember = (message: Message) => {
    const props = { message };
    messageComponents.push(<MessageMember key={`member-${message.id}`} {...props} />);
  };

  const pushMessageMerge = (message: Message) => {
    const props = { message };
    messageComponents.push(<MessageMerge key={`merge-${message.id}`} {...props} />);
  };

  const pushMessageTime = (message: Message, time: Dayjs, hasDateOnTop = false) => {
    const props = { time, hasDateOnTop };
    messageComponents.push(<MessageTime key={`time-${message.id}`} {...props} />);
  };

  const pushMessageDate = (message: Message, time: Dayjs) => {
    const props = { time };
    messageComponents.push(<MessageDate key={`date-${message.id}`} {...props} />);
  };

  const pushMessageInitial = (message: Message) => {
    const props = { message };
    messageComponents.push(<MessageInitial key={`initial-${message.id}`} {...props} />);
  };

  messages.forEach((message) => {
    // most recent messages first
    switch (message.type) {
      case 'text/plain':
      case 'application/data-transfer+json':
        if (lastAuthor !== message.author) {
          pushMessageBubblesGroup();
        }
        messagesGroup.push(message);
        break;
      case 'application/call-history+json':
        pushMessageBubblesGroup();
        pushMessageCall(message);
        break;
      case 'member':
        pushMessageBubblesGroup();
        pushMessageMember(message);
        break;
      case 'merge':
        pushMessageBubblesGroup();
        pushMessageMerge(message);
        break;
      case 'initial':
      default:
        break;
    }

    const time = dayjs.unix(Number(message.timestamp));
    if (message.type === 'initial') {
      pushMessageBubblesGroup();
      pushMessageTime(message, time, true);
      pushMessageDate(message, time);
      pushMessageInitial(message);
    } else {
      if (
        // If the date is different
        lastTime?.year() !== time.year() ||
        lastTime?.dayOfYear() !== time.dayOfYear()
      ) {
        pushMessageBubblesGroup();
        pushMessageTime(message, time, true);
        pushMessageDate(message, time);
      } else if (
        // If more than 5 minutes have passed since the last message
        !lastTime.isBetween(time, time?.add(5, 'minute'))
      ) {
        pushMessageBubblesGroup();
        pushMessageTime(message, time);
      }

      lastTime = time;
      lastAuthor = message.author;
    }
  });

  return messageComponents;
};
