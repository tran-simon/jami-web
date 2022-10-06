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
import { Divider, InputBase } from '@mui/material';
import { Stack } from '@mui/system';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';

import {
  RecordVideoMessageButton,
  RecordVoiceMessageButton,
  SelectEmojiButton,
  SendMessageButton,
  UploadFileButton,
} from './Button';

type SendMessageFormProps = {
  onSend: (message: string) => void;
};

export default function SendMessageForm(props: SendMessageFormProps) {
  const [currentMessage, setCurrentMessage] = useState('');

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
    <Stack padding="30px 16px 0px 16px">
      <Divider
        sx={{
          bordeTop: '1px solid #E5E5E5',
        }}
      />
      <Stack
        component="form"
        onSubmit={handleSubmit}
        direction="row"
        alignItems="center"
        flexGrow={1}
        spacing="20px"
        padding="16px 0px"
      >
        <UploadFileButton />
        <RecordVoiceMessageButton />
        <RecordVideoMessageButton />

        <Stack flexGrow={1}>
          <InputBase
            placeholder="Write something nice"
            value={currentMessage}
            onChange={handleInputChange}
            sx={{
              fontSize: '15px',
              color: 'black',
              '& ::placeholder': {
                color: '#7E7E7E',
                opacity: 1,
              },
            }}
          />
        </Stack>
        <SelectEmojiButton onEmojiSelected={onEmojiSelected} />
        {currentMessage && <SendMessageButton type="submit" />}
      </Stack>
    </Stack>
  );
}
