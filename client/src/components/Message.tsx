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
import { Box, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Dayjs } from 'dayjs';
import { Message } from 'jami-web-common';
import { ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import dayjs from '../dayjsInitializer';
import { Account } from '../models/account';
import { Contact } from '../models/contact';
import { EmojiButton, MoreButton, ReplyMessageButton } from './Button';
import ConversationAvatar from './ConversationAvatar';
import PopoverList, { PopoverListItemData } from './PopoverList';
import {
  ArrowLeftCurved,
  ArrowLeftDown,
  ArrowRightUp,
  OppositeArrowsIcon,
  TrashBinIcon,
  TwoSheetsIcon,
} from './SvgIcon';

type MessagePosition = 'start' | 'end';

const notificationMessageTypes = ['initial', 'member'] as const;
type NotificationMessageType = typeof notificationMessageTypes[number];
const checkIsNotificationMessageType = (type: Message['type'] | undefined): type is NotificationMessageType => {
  return notificationMessageTypes.includes(type as NotificationMessageType);
};

const invisibleMessageTypes = ['application/update-profile', 'merge', 'vote'] as const;
type InvisibleMessageType = typeof invisibleMessageTypes[number];
const checkIsInvisibleMessageType = (type: Message['type'] | undefined): type is InvisibleMessageType => {
  return invisibleMessageTypes.includes(type as InvisibleMessageType);
};

const userMessageTypes = ['text/plain', 'application/data-transfer+json', 'application/call-history+json'] as const;
type UserMessageType = typeof userMessageTypes[number];
const checkIsUserMessageType = (type: Message['type'] | undefined): type is UserMessageType => {
  return userMessageTypes.includes(type as UserMessageType);
};

const checkShowsTime = (time: Dayjs, previousTime: Dayjs) => {
  return !previousTime.isSame(time) && !time.isBetween(previousTime, previousTime?.add(1, 'minute'));
};

const findPreviousVisibleMessage = (messages: Message[], messageIndex: number) => {
  for (let i = messageIndex + 1; i < messages.length; ++i) {
    const message = messages[i];
    if (!checkIsInvisibleMessageType(message?.type)) {
      return message;
    }
  }
};

const findNextVisibleMessage = (messages: Message[], messageIndex: number) => {
  for (let i = messageIndex - 1; i >= 0; --i) {
    const message = messages[i];
    if (!checkIsInvisibleMessageType(message?.type)) {
      return message;
    }
  }
};

const avatarSize = '22px';
const spacingBetweenAvatarAndBubble = '10px';
const bubblePadding = '16px';

interface MessageCallProps {
  message: Message;
  isAccountMessage: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}

const MessageCall = ({ message, isAccountMessage, isFirstOfGroup, isLastOfGroup }: MessageCallProps) => {
  const position = isAccountMessage ? 'end' : 'start';

  const { t } = useTranslation();
  const { bubbleColor, Icon, text, textColor } = useMemo(() => {
    const callDuration = dayjs.duration(parseInt(message?.duration || ''));
    if (callDuration.asSeconds() === 0) {
      if (isAccountMessage) {
        return {
          text: t('message_call_outgoing_missed'),
          Icon: ArrowLeftCurved,
          textColor: 'white',
          bubbleColor: '#005699' + '80', // opacity 50%
        };
      } else {
        return {
          text: t('message_call_incoming_missed'),
          Icon: ArrowLeftCurved,
          textColor: 'black',
          bubbleColor: '#C6C6C6',
        };
      }
    } else {
      const minutes = Math.floor(callDuration.asMinutes()).toString().padStart(2, '0');
      const seconds = callDuration.format('ss');
      const interpolations = {
        duration: `${minutes}:${seconds}`,
      };
      if (isAccountMessage) {
        return {
          text: t('message_call_outgoing', interpolations),
          Icon: ArrowRightUp,
          textColor: 'white',
          bubbleColor: '#005699',
        };
      } else {
        return {
          text: t('message_call_incoming', interpolations),
          Icon: ArrowLeftDown,
          textcolor: 'black',
          bubbleColor: '#E5E5E5',
        };
      }
    }
  }, [isAccountMessage, message, t]);

  return (
    <Bubble position={position} isFirstOfGroup={isFirstOfGroup} isLastOfGroup={isLastOfGroup} bubbleColor={bubbleColor}>
      <Stack direction="row" spacing="10px" alignItems="center">
        <Icon sx={{ fontSize: '16px', color: textColor }} />
        <Typography variant="body1" color={textColor} textAlign={position} fontWeight="bold" textTransform="uppercase">
          {text}
        </Typography>
      </Stack>
    </Bubble>
  );
};

const MessageInitial = () => {
  const { t } = useTranslation();
  return <>{t('message_swarm_created')}</>;
};

interface MessageDataTransferProps {
  message: Message;
  isAccountMessage: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}

const MessageDataTransfer = ({ isAccountMessage, isFirstOfGroup, isLastOfGroup }: MessageDataTransferProps) => {
  const position = isAccountMessage ? 'end' : 'start';
  return (
    <Bubble bubbleColor="#E5E5E5" position={position} isFirstOfGroup={isFirstOfGroup} isLastOfGroup={isLastOfGroup}>
      &quot;data-transfer&quot;
    </Bubble>
  );
};

interface MessageMemberProps {
  message: Message;
}

const MessageMember = ({ message }: MessageMemberProps) => {
  const { t } = useTranslation();
  return (
    <Chip
      sx={{
        width: 'fit-content',
      }}
      label={t('message_user_joined', { user: message.author })}
    />
  );
};

interface MessageTextProps {
  message: Message;
  isAccountMessage: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
}

const MessageText = ({ message, isAccountMessage, isFirstOfGroup, isLastOfGroup }: MessageTextProps) => {
  const position = isAccountMessage ? 'end' : 'start';
  const bubbleColor = isAccountMessage ? '#005699' : '#E5E5E5';
  const textColor = isAccountMessage ? 'white' : 'black';
  return (
    <MessageTooltip position={position}>
      <Bubble
        bubbleColor={bubbleColor}
        position={position}
        isFirstOfGroup={isFirstOfGroup}
        isLastOfGroup={isLastOfGroup}
      >
        <Typography variant="body1" color={textColor} textAlign={position}>
          {message.body}
        </Typography>
      </Bubble>
    </MessageTooltip>
  );
};

interface DateIndicatorProps {
  time: Dayjs;
}

const DateIndicator = ({ time }: DateIndicatorProps) => {
  const { i18n } = useTranslation();

  const textDate = useMemo(() => {
    if (time.isToday()) {
      return new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }).format(0, 'day');
    } else if (time.isYesterday()) {
      return new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }).format(-1, 'day');
    } else {
      return dayjs(time).locale(i18n.language).format('L');
    }
  }, [i18n, time]);

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
          textTransform="capitalize"
        >
          {textDate}
        </Typography>
      </Divider>
    </Box>
  );
};

interface TimeIndicatorProps {
  time: Dayjs;
  hasDateOnTop: boolean;
}

const TimeIndicator = ({ time, hasDateOnTop }: TimeIndicatorProps) => {
  const { i18n } = useTranslation();

  const textTime = useMemo(() => {
    return dayjs(time).locale(i18n.language).format('LT');
  }, [i18n, time]);

  return (
    <Stack direction="row" justifyContent="center" marginTop={hasDateOnTop ? '20px' : '30px'}>
      <Typography variant="caption" color="#A7A7A7" fontWeight={700}>
        {textTime}
      </Typography>
    </Stack>
  );
};

interface NotificationMessageRowProps {
  message: Message;
}

const NotificationMessageRow = ({ message }: NotificationMessageRowProps) => {
  let messageComponent;
  switch (message.type) {
    case 'initial':
      messageComponent = <MessageInitial />;
      break;
    case 'member':
      messageComponent = <MessageMember message={message} />;
      break;
    default:
      console.error(`${NotificationMessageRow.name} received unhandled message type: ${message.type}`);
      return null;
  }

  return (
    <Stack paddingTop={'30px'} alignItems="center">
      {messageComponent}
    </Stack>
  );
};

interface UserMessageRowProps {
  message: Message;
  isAccountMessage: boolean;
  previousMessage: Message | undefined;
  nextMessage: Message | undefined;
  time: Dayjs;
  showsTime: boolean;
  author: Account | Contact;
}

const UserMessageRow = ({
  message,
  previousMessage,
  nextMessage,
  isAccountMessage,
  time,
  showsTime,
  author,
}: UserMessageRowProps) => {
  const authorName = author.getDisplayName();
  const position = isAccountMessage ? 'end' : 'start';

  const previousIsUserMessageType = checkIsUserMessageType(previousMessage?.type);
  const nextIsUserMessageType = checkIsUserMessageType(nextMessage?.type);
  const nextTime = dayjs.unix(Number(nextMessage?.timestamp));
  const nextShowsTime = checkShowsTime(nextTime, time);
  const isFirstOfGroup = showsTime || !previousIsUserMessageType || previousMessage?.author !== message.author;
  const isLastOfGroup = nextShowsTime || !nextIsUserMessageType || message.author !== nextMessage?.author;

  const props = {
    message,
    isAccountMessage,
    isFirstOfGroup,
    isLastOfGroup,
  };

  let MessageComponent;
  switch (message.type) {
    case 'text/plain':
      MessageComponent = MessageText;
      break;
    case 'application/data-transfer+json':
      MessageComponent = MessageDataTransfer;
      break;
    case 'application/call-history+json':
      MessageComponent = MessageCall;
      break;
    default:
      console.error(`${UserMessageRow.name} received unhandled message type: ${message.type}`);
      return null;
  }

  const participantNamePadding = isAccountMessage
    ? bubblePadding
    : parseInt(avatarSize) + parseInt(spacingBetweenAvatarAndBubble) + parseInt(bubblePadding) + 'px';

  return (
    <Stack alignItems={position}>
      {isFirstOfGroup && (
        <Box padding={`30px ${participantNamePadding} 0 ${participantNamePadding}`}>
          <ParticipantName name={authorName} />
        </Box>
      )}
      <Stack
        direction="row"
        justifyContent={position}
        alignItems="end"
        spacing={spacingBetweenAvatarAndBubble}
        paddingTop="6px"
        width="66.66%"
      >
        <Box sx={{ width: avatarSize }}>
          {!isAccountMessage && isLastOfGroup && (
            <ConversationAvatar
              displayName={authorName}
              sx={{ width: avatarSize, height: avatarSize, fontSize: '15px' }}
            />
          )}
        </Box>
        <MessageComponent {...props} />
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
  const additionalOptions: PopoverListItemData[] = [
    {
      Icon: TwoSheetsIcon,
      label: 'Copy',
      onClick: () => {},
    },
    {
      Icon: OppositeArrowsIcon,
      label: 'Transfer',
      onClick: () => {},
    },
    {
      Icon: TrashBinIcon,
      label: 'Delete message',
      onClick: () => {},
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
          <Stack // Main options
            direction="row"
            spacing="16px"
            padding="16px"
          >
            {emojis.map((emoji) => (
              <EmojiButton key={emoji} emoji={emoji} />
            ))}
            <ReplyMessageButton />
            <MoreButton onClick={toggleMoreMenu} />
          </Stack>
          {open && (
            <>
              <Divider sx={{ marginX: '16px' }} />
              <PopoverList items={additionalOptions} />
            </>
          )}
        </Stack>
      }
    >
      {/* div fixes 'Function components cannot be given refs' error */}
      <div>{children}</div>
    </Tooltip>
  );
})(({ position }) => {
  const largeRadius = '20px';
  const smallRadius = '5px';
  return {
    backgroundColor: 'white',
    padding: '0px',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: largeRadius,
    borderStartStartRadius: position === 'start' ? smallRadius : largeRadius,
    borderStartEndRadius: position === 'end' ? smallRadius : largeRadius,
    overflow: 'hidden',
  };
});

interface BubbleProps {
  position: MessagePosition;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  bubbleColor: string;
  children: ReactNode;
}

const Bubble = ({ position, isFirstOfGroup, isLastOfGroup, bubbleColor, children }: BubbleProps) => {
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
    <Box
      sx={{
        width: 'fit-content',
        backgroundColor: bubbleColor,
        padding: bubblePadding,
        ...radius,
      }}
    >
      {children}
    </Box>
  );
};

interface ParticipantNameProps {
  name: string;
}

const ParticipantName = ({ name }: ParticipantNameProps) => {
  return (
    <Typography variant="caption" color="#A7A7A7" fontWeight={700}>
      {name}
    </Typography>
  );
};

interface MessageProps {
  messageIndex: number;
  messages: Message[];
  isAccountMessage: boolean;
  author: Account | Contact;
}

export const MessageRow = ({ messageIndex, messages, isAccountMessage, author }: MessageProps) => {
  const message = messages[messageIndex];
  const previousMessage = findPreviousVisibleMessage(messages, messageIndex);
  const nextMessage = findNextVisibleMessage(messages, messageIndex);
  const time = dayjs.unix(Number(message.timestamp));
  const previousTime = dayjs.unix(Number(previousMessage?.timestamp));
  const showDate =
    message?.type === 'initial' || previousTime.year() !== time.year() || previousTime.dayOfYear() !== time.dayOfYear();
  const showTime = checkShowsTime(time, previousTime);
  let messageComponent;
  if (checkIsUserMessageType(message.type)) {
    messageComponent = (
      <UserMessageRow
        message={message}
        previousMessage={previousMessage}
        nextMessage={nextMessage}
        time={time}
        showsTime={showTime}
        isAccountMessage={isAccountMessage}
        author={author}
      />
    );
  } else if (checkIsNotificationMessageType(message.type)) {
    messageComponent = <NotificationMessageRow message={message} />;
  } else if (checkIsInvisibleMessageType(message.type)) {
    return null;
  } else {
    const _exhaustiveCheck: never = message.type;
    return _exhaustiveCheck;
  }

  return (
    <Stack>
      {showDate && <DateIndicator time={time} />}
      {showTime && <TimeIndicator time={time} hasDateOnTop={showDate} />}
      {messageComponent}
    </Stack>
  );
};
