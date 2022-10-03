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
