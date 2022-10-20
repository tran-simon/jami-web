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
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { Account, ConversationMember, Message } from 'jami-web-common';
import { ReactElement } from 'react';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmojiButton, MoreButton, ReplyMessageButton } from './Button';
import ConversationAvatar from './ConversationAvatar';
import { OppositeArrowsIcon, TrashBinIcon, TwoSheetsIcon } from './SvgIcon';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

type MessagePosition = 'start' | 'end';

export const MessageCall = () => {
  return <Stack alignItems="center">&quot;Appel&quot;</Stack>;
};

export const MessageInitial = () => {
  const { t } = useTranslation();
  return <Stack alignItems="center">{t('message_swarm_created')}</Stack>;
};

interface MessageDataTransferProps {
  position: MessagePosition;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}

export const MessageDataTransfer = ({ position, isFirstOfGroup, isLastOfGroup }: MessageDataTransferProps) => {
  return (
    <MessageBubble
      backgroundColor={'#E5E5E5'}
      position={position}
      isFirstOfGroup={isFirstOfGroup}
      isLastOfGroup={isLastOfGroup}
    >
      &quot;data-transfer&quot;
    </MessageBubble>
  );
};

interface MessageMemberProps {
  message: Message;
}

export const MessageMember = ({ message }: MessageMemberProps) => {
  const { t } = useTranslation();
  return (
    <Stack alignItems="center">
      <Chip
        sx={{
          width: 'fit-content',
        }}
        label={t('message_user_joined', { user: message.author })}
      />
    </Stack>
  );
};

export const MessageMerge = () => {
  return <Stack alignItems="center">&quot;merge&quot;</Stack>;
};

interface MessageTextProps {
  message: Message;
  position: MessagePosition;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  textColor: string;
  bubbleColor: string;
}

export const MessageText = ({
  message,
  position,
  isFirstOfGroup,
  isLastOfGroup,
  textColor,
  bubbleColor,
}: MessageTextProps) => {
  return (
    <MessageBubble
      backgroundColor={bubbleColor}
      position={position}
      isFirstOfGroup={isFirstOfGroup}
      isLastOfGroup={isLastOfGroup}
    >
      <Typography variant="body1" color={textColor} textAlign={position}>
        {message.body}
      </Typography>
    </MessageBubble>
  );
};

interface MessageDateProps {
  time: Dayjs;
}

export const MessageDate = ({ time }: MessageDateProps) => {
  let textDate;

  if (time.isToday()) {
    textDate = 'Today';
  } else if (time.isYesterday()) {
    textDate = 'Yesterday';
  } else {
    const date = time.date().toString().padStart(2, '0');
    const month = (time.month() + 1).toString().padStart(2, '0');
    textDate = `${date}/${month}/${time.year()}`;
  }

  return (
    <Box marginTop="30px">
      <Divider
        sx={{
          '.MuiDivider-wrapper': {
            margin: 0,
            padding: 0,
          },
          '&::before': {
            borderTop: '1px solid #E5E5E5',
          },
          '&::after': {
            borderTop: '1px solid #E5E5E5',
          },
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          border="1px solid #E5E5E5"
          borderRadius="5px"
          padding="10px 16px"
        >
          {textDate}
        </Typography>
      </Divider>
    </Box>
  );
};

interface MessageTimeProps {
  time: Dayjs;
  hasDateOnTop: boolean;
}

export const MessageTime = ({ time, hasDateOnTop }: MessageTimeProps) => {
  const hour = time.hour().toString().padStart(2, '0');
  const minute = time.minute().toString().padStart(2, '0');
  const textTime = `${hour}:${minute}`;

  return (
    <Stack direction="row" justifyContent="center" margin="30px" marginTop={hasDateOnTop ? '20px' : '30px'}>
      <Typography variant="caption" color="#A7A7A7" fontWeight={700}>
        {textTime}
      </Typography>
    </Stack>
  );
};

interface MessageBubblesGroupProps {
  account: Account;
  messages: Message[];
  members: ConversationMember[];
}

export const MessageBubblesGroup = ({ account, messages, members }: MessageBubblesGroupProps) => {
  const isUser = messages[0]?.author === account.getUri();
  const position = isUser ? 'end' : 'start';
  const bubbleColor = isUser ? '#005699' : '#E5E5E5';
  const textColor = isUser ? 'white' : 'black';

  let authorName;
  if (isUser) {
    authorName = account.getDisplayName();
  } else {
    const member = members.find((member) => messages[0]?.author === member.contact.getUri());
    authorName = member?.contact?.getDisplayName() || '';
  }

  return (
    <Stack // Row for a group of message bubbles with the user's infos
      direction="row"
      justifyContent={position}
      alignItems="end"
      spacing="10px"
    >
      {!isUser && (
        <ConversationAvatar displayName={authorName} sx={{ width: '22px', height: '22px', fontSize: '15px' }} />
      )}
      <Stack // Container to align the bubbles to the same side of a row
        width="66.66%"
        alignItems={position}
      >
        <ParticipantName name={authorName} />
        <Stack // Container for a group of message bubbles
          spacing="6px"
          alignItems={position}
          direction="column-reverse"
        >
          {messages.map((message, index) => {
            let Component: typeof MessageText | typeof MessageDataTransfer;
            switch (message.type) {
              case 'text/plain':
                Component = MessageText;
                break;
              case 'application/data-transfer+json':
                Component = MessageDataTransfer;
                break;
              default:
                return null;
            }
            return (
              <Component // Single message
                key={message.id}
                message={message}
                textColor={textColor}
                position={position}
                bubbleColor={bubbleColor}
                isFirstOfGroup={index === messages.length - 1}
                isLastOfGroup={index === 0}
              />
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

interface MessageTooltipProps {
  className?: string;
  position: MessagePosition;
  children: ReactElement;
}

const MessageTooltip = styled(({ className, position, children }: MessageTooltipProps) => {
  const [open, setOpen] = useState(false);
  const emojis = ['😎', '😄', '😍']; // Should be last three used emojis
  const additionalOptions = [
    {
      Icon: TwoSheetsIcon,
      text: 'Copy',
      action: () => {},
    },
    {
      Icon: OppositeArrowsIcon,
      text: 'Transfer',
      action: () => {},
    },
    {
      Icon: TrashBinIcon,
      text: 'Delete message',
      action: () => {},
    },
  ];

  const toggleMoreMenu = useCallback(() => setOpen((open) => !open), [setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Tooltip
      classes={{ tooltip: className }} // Required for styles. Don't know why
      placement={position === 'start' ? 'right-start' : 'left-start'}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-2, -30],
            },
          },
        ],
      }}
      onClose={onClose}
      title={
        <Stack>
          {/* Whole tooltip's content */}
          <Stack // Main options
            direction="row"
            spacing="16px"
          >
            {emojis.map((emoji) => (
              <EmojiButton key={emoji} emoji={emoji} />
            ))}
            <ReplyMessageButton />
            <MoreButton onClick={toggleMoreMenu} />
          </Stack>
          {open && ( // Additional menu options
            <>
              <Divider sx={{ paddingTop: '16px' }} />
              <List sx={{ padding: 0, paddingTop: '8px', marginBottom: '-8px' }}>
                {additionalOptions.map((option) => (
                  <ListItemButton
                    key={option.text}
                    sx={{
                      padding: '8px',
                    }}
                  >
                    <Stack // Could not find proper way to set spacing between ListItemIcon and ListItemText
                      direction="row"
                      spacing="16px"
                    >
                      <option.Icon
                        sx={{
                          height: '16px',
                          margin: 0,
                          color: (theme: Theme) => theme?.palette?.primary?.dark,
                        }}
                      />
                      <ListItemText
                        primary={option.text}
                        primaryTypographyProps={{
                          fontSize: '12px',
                          lineHeight: '16px',
                        }}
                        sx={{
                          height: '16px',
                          margin: 0,
                        }}
                      />
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Stack>
      }
    >
      {children}
    </Tooltip>
  );
})(({ position }) => {
  const largeRadius = '20px';
  const smallRadius = '5px';
  return {
    backgroundColor: 'white',
    padding: '16px',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: largeRadius,
    borderStartStartRadius: position === 'start' ? smallRadius : largeRadius,
    borderStartEndRadius: position === 'end' ? smallRadius : largeRadius,
  };
});

interface MessageBubbleProps {
  position: MessagePosition;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  backgroundColor: string;
  children: ReactNode;
}

const MessageBubble = ({ position, isFirstOfGroup, isLastOfGroup, backgroundColor, children }: MessageBubbleProps) => {
  const largeRadius = '20px';
  const smallRadius = '5px';
  const radius = useMemo(() => {
    if (position === 'start') {
      return {
        borderStartStartRadius: isFirstOfGroup ? largeRadius : smallRadius,
        borderStartEndRadius: largeRadius,
        borderEndStartRadius: isLastOfGroup ? largeRadius : smallRadius,
        borderEndEndRadius: largeRadius,
      };
    }
    return {
      borderStartStartRadius: largeRadius,
      borderStartEndRadius: isFirstOfGroup ? largeRadius : smallRadius,
      borderEndStartRadius: largeRadius,
      borderEndEndRadius: isLastOfGroup ? largeRadius : smallRadius,
    };
  }, [isFirstOfGroup, isLastOfGroup, position]);

  return (
    <MessageTooltip position={position}>
      <Box
        sx={{
          width: 'fit-content',
          backgroundColor: backgroundColor,
          padding: '16px',
          ...radius,
        }}
      >
        {children}
      </Box>
    </MessageTooltip>
  );
};

interface ParticipantNameProps {
  name: string;
}

const ParticipantName = ({ name }: ParticipantNameProps) => {
  return (
    <Box marginBottom="6px" marginLeft="16px" marginRight="16px">
      <Typography variant="caption" color="#A7A7A7" fontWeight={700}>
        {name}
      </Typography>
    </Box>
  );
};
