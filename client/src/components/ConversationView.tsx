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
import { Account, Conversation, ConversationMember, Message } from 'jami-web-common';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { SocketContext } from '../contexts/Socket';
import { useAccountQuery } from '../services/Account';
import { useConversationQuery, useMessagesQuery, useSendMessageMutation } from '../services/Conversation';
import { translateEnumeration, TranslateEnumerationOptions } from '../utils/translations';
import { AddParticipantButton, ShowOptionsMenuButton, StartAudioCallButton, StartVideoCallButton } from './Button';
import LoadingPage from './Loading';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';

type ConversationViewProps = {
  accountId: string;
  conversationId: string;
};
const ConversationView = ({ accountId, conversationId }: ConversationViewProps) => {
  const socket = useContext(SocketContext);
  const [account, setAccount] = useState<Account | undefined>();
  const [conversation, setConversation] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const accountQuery = useAccountQuery(accountId);
  const conversationQuery = useConversationQuery(accountId, conversationId);
  const messagesQuery = useMessagesQuery(accountId, conversationId);
  const sendMessageMutation = useSendMessageMutation(accountId, conversationId);

  useEffect(() => {
    if (accountQuery.isSuccess) {
      setAccount(Account.from(accountQuery.data));
    }
  }, [accountQuery.isSuccess, accountQuery.data]);

  useEffect(() => {
    if (conversationQuery.isSuccess) {
      const conversation = Conversation.from(accountId, conversationQuery.data);
      setConversation(conversation);
    }
  }, [accountId, conversationQuery.isSuccess, conversationQuery.data]);

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      const sortedMessages = sortMessages(messagesQuery.data);
      setMessages(sortedMessages);
    }
  }, [messagesQuery.isSuccess, messagesQuery.data]);

  useEffect(() => {
    setIsLoading(accountQuery.isLoading || conversationQuery.isLoading || messagesQuery.isLoading);
  }, [accountQuery.isLoading, conversationQuery.isLoading, messagesQuery.isLoading]);

  useEffect(() => {
    setError(accountQuery.isLoading || conversationQuery.isError || messagesQuery.isError);
  }, [accountQuery.isLoading, conversationQuery.isError, messagesQuery.isError]);

  const sendMessage = useCallback((message: string) => sendMessageMutation.mutate(message), [sendMessageMutation]);

  useEffect(() => {
    if (!conversation) return;
    console.log(`io set conversation ${conversationId} ` + socket);
    if (socket) {
      socket.emit('conversation', {
        accountId,
        conversationId,
      });
      socket.off('newMessage');
      socket.on('newMessage', (data) => {
        console.log('newMessage');
        setMessages((messages) => addMessage(messages, data));
      });
    }
  }, [accountId, conversation, conversationId, socket]);

  if (isLoading) {
    return <LoadingPage />;
  } else if (error || !account || !conversation) {
    return <div>Error loading {conversationId}</div>;
  }

  return (
    <Stack height="100%">
      <ConversationHeader
        account={account}
        members={conversation.getMembers()}
        adminTitle={conversation.infos.title as string}
        conversationId={conversationId}
      />
      <Divider
        sx={{
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <MessageList account={account} members={conversation.getMembers()} messages={messages} />
      <Divider
        sx={{
          margin: '30px 16px 0px 16px',
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <SendMessageForm account={account} members={conversation.getMembers()} onSend={sendMessage} />
    </Stack>
  );
};

type ConversationHeaderProps = {
  account: Account;
  conversationId: string;
  members: ConversationMember[];
  adminTitle: string | undefined;
};

const ConversationHeader = ({ account, members, adminTitle, conversationId }: ConversationHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const title = useMemo(() => {
    if (adminTitle) {
      return adminTitle;
    }

    const options: TranslateEnumerationOptions<ConversationMember> = {
      elementPartialKey: 'member',
      getElementValue: (member) => getMemberName(member),
      translaters: [
        () =>
          // The user is chatting with themself
          t('conversation_title_one', { member0: account?.getDisplayName() }),
        (interpolations) => t('conversation_title_one', interpolations),
        (interpolations) => t('conversation_title_two', interpolations),
        (interpolations) => t('conversation_title_three', interpolations),
        (interpolations) => t('conversation_title_four', interpolations),
        (interpolations) => t('conversation_title_more', interpolations),
      ],
    };

    return translateEnumeration<ConversationMember>(members, options);
  }, [account, members, adminTitle, t]);

  const startCall = (withVideo = false) => {
    let url = `/deprecated-account/${account.getId()}/call/${conversationId}`;
    if (withVideo) {
      url += '?video=true';
    }
    navigate(url);
  };

  return (
    <Stack direction="row" padding="16px">
      <Stack flex={1} justifyContent="center" whiteSpace="nowrap" overflow="hidden">
        <Typography variant="h3" textOverflow="ellipsis">
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing="20px">
        <StartAudioCallButton onClick={() => startCall(false)} />
        <StartVideoCallButton onClick={() => startCall(true)} />
        <AddParticipantButton />
        <ShowOptionsMenuButton />
      </Stack>
    </Stack>
  );
};

const getMemberName = (member: ConversationMember) => {
  const contact = member.contact;
  return contact.getDisplayName();
};

const addMessage = (sortedMessages: Message[], message: Message) => {
  if (sortedMessages.length === 0) {
    return [message];
  } else if (message.id === sortedMessages[sortedMessages.length - 1].linearizedParent) {
    return [...sortedMessages, message];
  } else if (message.linearizedParent === sortedMessages[0].id) {
    return [message, ...sortedMessages];
  } else {
    console.log("Can't insert message " + message.id);
    return sortedMessages;
  }
};

const sortMessages = (messages: Message[]) => {
  let sortedMessages: Message[] = [];
  messages.forEach((message) => (sortedMessages = addMessage(sortedMessages, message)));
  return sortedMessages;
};

export default ConversationView;
