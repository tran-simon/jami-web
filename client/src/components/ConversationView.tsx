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
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '../contexts/AuthProvider';
import { CallManagerContext } from '../contexts/CallManagerProvider';
import { useConversationContext } from '../contexts/ConversationProvider';
import { ConversationMember } from '../models/Conversation';
import CallInterface from '../pages/CallInterface';
import ChatInterface from '../pages/ChatInterface';
import { translateEnumeration, TranslateEnumerationOptions } from '../utils/translations';
import { AddParticipantButton, ShowOptionsMenuButton, StartAudioCallButton, StartVideoCallButton } from './Button';

const ConversationView = () => {
  const { conversationId } = useConversationContext();
  const { callData } = useContext(CallManagerContext);

  if (callData && callData.conversationId === conversationId) {
    return <CallInterface />;
  }

  return (
    <Stack flexGrow={1} height="100%">
      <ConversationHeader />
      <Divider
        sx={{
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <ChatInterface />
    </Stack>
  );
};

const ConversationHeader = () => {
  const { account } = useAuthContext();
  const { conversation, conversationId } = useConversationContext();
  const { startCall } = useContext(CallManagerContext);
  const { t } = useTranslation();

  const members = conversation.getMembers();
  const adminTitle = conversation.infos.title as string;

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

  return (
    <Stack direction="row" padding="16px" overflow="hidden">
      <Stack flex={1} justifyContent="center" whiteSpace="nowrap" overflow="hidden">
        <Typography variant="h3" textOverflow="ellipsis">
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing="20px">
        <StartAudioCallButton onClick={() => startCall({ conversationId, role: 'caller' })} />
        <StartVideoCallButton onClick={() => startCall({ conversationId, role: 'caller', withVideoOn: true })} />
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

export default ConversationView;
