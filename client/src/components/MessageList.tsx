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
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { ConversationMember, Message } from 'jami-web-common';
import { MutableRefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Waypoint } from 'react-waypoint';

import { useAuthContext } from '../contexts/AuthProvider';
import { MessageRow } from './Message';
import { ArrowDownIcon } from './SvgIcon';

interface MessageListProps {
  members: ConversationMember[];
  messages: Message[];
}

export default function MessageList({ members, messages }: MessageListProps) {
  const { account } = useAuthContext();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listBottomRef = useRef<HTMLElement>();

  return (
    <>
      <Stack flex={1} overflow="auto" padding="0px 16px" direction="column-reverse">
        {/* Here is the bottom of the list of messages because of 'column-reverse' */}
        <Box ref={listBottomRef} />
        <Waypoint
          onEnter={() => setShowScrollButton(false)}
          onLeave={() => setShowScrollButton(true)}
          bottomOffset="-100px"
        />
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
        <Waypoint onEnter={() => console.log('should load more messages')} topOffset="-200px" />
      </Stack>
      {showScrollButton && (
        <Box position="relative">
          <Box position="absolute" bottom="10px" left="50%" sx={{ transform: 'translate(-50%)' }}>
            <ScrollToEndButton listBottomRef={listBottomRef} />
          </Box>
        </Box>
      )}
    </>
  );
}

interface ScrollToEndButtonProps {
  listBottomRef: MutableRefObject<HTMLElement | undefined>;
}

const ScrollToEndButton = ({ listBottomRef }: ScrollToEndButtonProps) => {
  const { t } = useTranslation();
  const textColor = 'white';
  return (
    <Stack
      direction="row"
      borderRadius="5px"
      height="30px"
      alignItems="center"
      padding="0 16px"
      spacing="12px"
      sx={{
        backgroundColor: '#005699', // Should be same color as message bubble
        cursor: 'pointer',
      }}
      onClick={() => listBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
    >
      <ArrowDownIcon sx={{ fontSize: '12px', color: textColor }} />
      <Typography variant="caption" fontWeight="bold" color={textColor}>
        {t('messages_scroll_to_end')}
      </Typography>
    </Stack>
  );
};
