import dayjs from 'dayjs';
import { useMemo } from 'react';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import { Stack } from '@mui/system';
import {
  MessageCall,
  MessageDate,
  MessageInitial,
  MessageMember,
  MessageBubblesGroup,
  MessageTime,
  MessageMerge,
} from './Message';

dayjs.extend(dayOfYear);
dayjs.extend(isBetween);

export default function MessageList(props) {
  const messagesComponents = useMemo(() => buildMessagesList(props.messages), [props.messages]);

  return (
    <Stack marginLeft="16px" marginRight="16px" direction="column-reverse">
      {messagesComponents?.map(({ Component, id, props }) => (
        <Component key={id} {...props} />
      ))}
    </Stack>
  );
}

const buildMessagesList = (messages) => {
  if (messages.length == 0) {
    return null;
  }

  const components = [];
  let lastTime = dayjs.unix(messages[0].timestamp);
  let lastAuthor = messages[0].author;
  let messageBubblesGroup = [];

  const pushMessageBubblesGroup = () => {
    if (messageBubblesGroup.length == 0) {
      return;
    }
    components.push({
      id: `group-${messageBubblesGroup[0].id}`,
      Component: MessageBubblesGroup,
      props: { messages: messageBubblesGroup },
    });
    messageBubblesGroup = [];
  };

  const pushMessageCall = (message) => {
    components.push({
      id: `call-${message.id}`,
      Component: MessageCall,
      props: { message },
    });
  };

  const pushMessageMember = (message) => {
    components.push({
      id: `member-${message.id}`,
      Component: MessageMember,
      props: { message },
    });
  };

  const pushMessageMerge = (message) => {
    components.push({
      id: `merge-${message.id}`,
      Component: MessageMerge,
      props: { message },
    });
  };

  const pushMessageTime = (message, time, hasDateOnTop = false) => {
    components.push({
      id: `time-${message.id}`,
      Component: MessageTime,
      props: { time, hasDateOnTop },
    });
  };

  const pushMessageDate = (message, time) => {
    components.push({
      id: `date-${message.id}`,
      Component: MessageDate,
      props: { time },
    });
  };

  const pushMessageInitial = (message) => {
    components.push({
      id: `initial-${message.id}`,
      Component: MessageInitial,
      props: { message },
    });
  };

  messages.forEach((message) => {
    // most recent messages first
    switch (message.type) {
      case 'text/plain':
      case 'application/data-transfer+json':
        if (lastAuthor != message.author) {
          pushMessageBubblesGroup();
        }
        messageBubblesGroup.push(message);
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

    const time = dayjs.unix(message.timestamp);
    if (message.type == 'initial') {
      pushMessageBubblesGroup();
      pushMessageTime(message, time, true);
      pushMessageDate(message, time);
      pushMessageInitial(message);
    } else {
      if (
        // If the date is different
        lastTime?.year() != time.year() ||
        lastTime?.dayOfYear() != time.dayOfYear()
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

  return components;
};
