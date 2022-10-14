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
import { Box, Chip, Divider, List, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmojiButton, MoreButton, ReplyMessageButton } from './Button.tsx';
import ConversationAvatar from './ConversationAvatar';
import { OppositeArrowsIcon, TrashBinIcon, TwoSheetsIcon } from './SvgIcon.tsx';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const MessageCall = (props) => {
  return <Stack alignItems="center">&quot;Appel&quot;</Stack>;
};

export const MessageInitial = (props) => {
  const { t } = useTranslation();
  return <Stack alignItems="center">{t('message_swarm_created')}</Stack>;
};

export const MessageDataTransfer = (props) => {
  return (
    <MessageBubble
      backgroundColor={'#E5E5E5'}
      position={props.position}
      isFirstOfGroup={props.isFirstOfGroup}
      isLastOfGroup={props.isLastOfGroup}
    >
      &quot;data-transfer&quot;
    </MessageBubble>
  );
};

export const MessageMember = (props) => {
  const { t } = useTranslation();
  return (
    <Stack alignItems="center">
      <Chip
        sx={{
          width: 'fit-content',
        }}
        label={t('message_user_joined', { user: props.message.author })}
      />
    </Stack>
  );
};

export const MessageMerge = (props) => {
  return <Stack alignItems="center">&quot;merge&quot;</Stack>;
};

export const MessageText = (props) => {
  return (
    <MessageBubble
      backgroundColor={props.bubbleColor}
      position={props.position}
      isFirstOfGroup={props.isFirstOfGroup}
      isLastOfGroup={props.isLastOfGroup}
    >
      <Typography variant="body1" color={props.textColor} textAlign={props.position}>
        {props.message.body}
      </Typography>
    </MessageBubble>
  );
};

export const MessageDate = ({ time }) => {
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

export const MessageTime = ({ time, hasDateOnTop }) => {
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

export const MessageBubblesGroup = (props) => {
  const isUser = props.messages[0]?.author === props.account.getUri();
  const position = isUser ? 'end' : 'start';
  const bubbleColor = isUser ? '#005699' : '#E5E5E5';
  const textColor = isUser ? 'white' : 'black';

  let authorName;
  if (isUser) {
    authorName = props.account.getDisplayName();
  } else {
    const member = props.members.find((member) => props.messages[0]?.author === member.contact.getUri());
    const contact = member.contact;
    authorName = contact.getDisplayName();
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
        <ParticipantName name={authorName} position={position} />
        <Stack // Container for a group of message bubbles
          spacing="6px"
          alignItems={position}
          direction="column-reverse"
        >
          {props.messages.map((message, index) => {
            let Component;
            switch (message.type) {
              case 'text/plain':
                Component = MessageText;
                break;
              case 'application/data-transfer+json':
                Component = MessageDataTransfer;
                break;
            }
            return (
              <Component // Single message
                key={message.id}
                message={message}
                textColor={textColor}
                position={position}
                bubbleColor={bubbleColor}
                isFirstOfGroup={index == props.messages.length - 1}
                isLastOfGroup={index == 0}
              />
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

const MessageTooltip = styled(({ className, ...props }) => {
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
      {...props}
      classes={{ tooltip: className }} // Required for styles. Don't know why
      placement={props.position == 'start' ? 'right-start' : 'left-start'}
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
          {' '}
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
                          color: (theme) => theme.palette.primary.dark,
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
    />
  );
})(({ theme, position }) => {
  const largeRadius = '20px';
  const smallRadius = '5px';
  return {
    backgroundColor: 'white',
    padding: '16px',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: largeRadius,
    borderStartStartRadius: position == 'start' ? smallRadius : largeRadius,
    borderStartEndRadius: position == 'end' ? smallRadius : largeRadius,
  };
});

const MessageBubble = (props) => {
  const largeRadius = '20px';
  const smallRadius = '5px';
  const radius = useMemo(() => {
    if (props.position == 'start') {
      return {
        borderStartStartRadius: props.isFirstOfGroup ? largeRadius : smallRadius,
        borderStartEndRadius: largeRadius,
        borderEndStartRadius: props.isLastOfGroup ? largeRadius : smallRadius,
        borderEndEndRadius: largeRadius,
      };
    }
    return {
      borderStartStartRadius: largeRadius,
      borderStartEndRadius: props.isFirstOfGroup ? largeRadius : smallRadius,
      borderEndStartRadius: largeRadius,
      borderEndEndRadius: props.isLastOfGroup ? largeRadius : smallRadius,
    };
  }, [props.isFirstOfGroup, props.isLastOfGroup, props.position]);

  return (
    <MessageTooltip position={props.position}>
      <Box
        sx={{
          width: 'fit-content',
          backgroundColor: props.backgroundColor,
          padding: '16px',
          ...radius,
        }}
      >
        {props.children}
      </Box>
    </MessageTooltip>
  );
};

const ParticipantName = (props) => {
  return (
    <Box marginBottom="6px" marginLeft="16px" marginRight="16px">
      <Typography variant="caption" color="#A7A7A7" fontWeight={700}>
        {props.name}
      </Typography>
    </Box>
  );
};
