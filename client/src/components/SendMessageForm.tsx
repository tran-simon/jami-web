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
import { InputBase } from '@mui/material';
import { Stack } from '@mui/system';
import { Account, ConversationMember } from 'jami-web-common';
import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { translateEnumeration, TranslateEnumerationOptions } from '../utils/translations';
import {
  RecordVideoMessageButton,
  RecordVoiceMessageButton,
  SelectEmojiButton,
  SendMessageButton,
  UploadFileButton,
} from './Button';

type SendMessageFormProps = {
  account: Account;
  members: ConversationMember[];
  onSend: (message: string) => void;
};

export default function SendMessageForm(props: SendMessageFormProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const placeholder = usePlaceholder(props.account, props.members);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMessage) {
      props.onSend(currentMessage);
      setCurrentMessage('');
    }
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => setCurrentMessage(event.target.value);

  const onEmojiSelected = useCallback(
    (emoji: string) => setCurrentMessage((currentMessage) => currentMessage + emoji),
    [setCurrentMessage]
  );

  return (
    <Stack component="form" onSubmit={handleSubmit} direction="row" alignItems="center" spacing="20px" padding="16px">
      <UploadFileButton />
      <RecordVoiceMessageButton />
      <RecordVideoMessageButton />
      <Stack flexGrow={1}>
        <InputBase
          placeholder={placeholder}
          value={currentMessage}
          onChange={handleInputChange}
          sx={{
            fontSize: '15px',
            color: 'black',
            '& ::placeholder': {
              color: '#7E7E7E',
              opacity: 1,
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Stack>
      <SelectEmojiButton onEmojiSelected={onEmojiSelected} />
      {currentMessage && <SendMessageButton type="submit" />}
    </Stack>
  );
}

const usePlaceholder = (account: Account, members: ConversationMember[]) => {
  const { t } = useTranslation();

  return useMemo(() => {
    const options: TranslateEnumerationOptions<ConversationMember> = {
      elementPartialKey: 'member',
      getElementValue: (member) => getMemberName(member),
      translaters: [
        () =>
          // The user is chatting with themself
          t('message_input_placeholder_one', { member0: account?.getDisplayName() }),
        (interpolations) => t('message_input_placeholder_one', interpolations),
        (interpolations) => t('message_input_placeholder_two', interpolations),
        (interpolations) => t('message_input_placeholder_three', interpolations),
        (interpolations) => t('message_input_placeholder_four', interpolations),
        (interpolations) => t('message_input_placeholder_more', interpolations),
      ],
    };

    return translateEnumeration<ConversationMember>(members, options);
  }, [account, members, t]);
};

const getMemberName = (member: ConversationMember) => {
  const contact = member.contact;
  return contact.getDisplayName();
};
