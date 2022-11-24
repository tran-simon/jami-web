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
import { Box, Divider, Stack } from '@mui/material';
import { ConversationMember, ConversationMessage, Message, WebSocketMessageType } from 'jami-web-common';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { FilePreviewRemovable } from '../components/FilePreview';
import LoadingPage from '../components/Loading';
import MessageList from '../components/MessageList';
import SendMessageForm from '../components/SendMessageForm';
import { WebSocketContext } from '../contexts/WebSocketProvider';
import { useMessagesQuery, useSendMessageMutation } from '../services/Conversation';
import { FileHandler } from '../utils/files';

type ChatInterfaceProps = {
  conversationId: string;
  members: ConversationMember[];
};
const ChatInterface = ({ conversationId, members }: ChatInterfaceProps) => {
  const webSocket = useContext(WebSocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const messagesQuery = useMessagesQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation(conversationId);

  const [fileHandlers, setFileHandlers] = useState<FileHandler[]>([]);

  const onFilesDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFileHandlers = acceptedFiles.map((file) => new FileHandler(file));
      setFileHandlers((oldFileHandlers) => [...oldFileHandlers, ...newFileHandlers]);
    },
    [setFileHandlers]
  );

  const removeFile = useCallback(
    (fileId: string | number) => {
      setFileHandlers((fileHandlers) => fileHandlers.filter((fileHandler) => fileHandler.id !== fileId));
    },
    [setFileHandlers]
  );

  const {
    getRootProps,
    getInputProps,
    open: openFilePicker,
    isDragActive,
  } = useDropzone({
    onDrop: onFilesDrop,
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      const sortedMessages = sortMessages(messagesQuery.data);
      setMessages(sortedMessages);
    }
  }, [messagesQuery.isSuccess, messagesQuery.data]);

  useEffect(() => {
    setIsLoading(messagesQuery.isLoading);
  }, [messagesQuery.isLoading]);

  useEffect(() => {
    setError(messagesQuery.isError);
  }, [messagesQuery.isError]);

  const sendMessage = useCallback((message: string) => sendMessageMutation.mutate(message), [sendMessageMutation]);

  useEffect(() => {
    if (webSocket) {
      const conversationMessageListener = (data: ConversationMessage) => {
        console.log('newMessage');
        setMessages((messages) => addMessage(messages, data.message));
      };

      webSocket.bind(WebSocketMessageType.ConversationMessage, conversationMessageListener);

      return () => {
        webSocket.unbind(WebSocketMessageType.ConversationMessage, conversationMessageListener);
      };
    }
  }, [webSocket]);

  if (isLoading) {
    return <LoadingPage />;
  } else if (error) {
    return <div>Error loading {conversationId}</div>;
  }

  return (
    <Stack flex={1} overflow="hidden" {...getRootProps()} paddingBottom="16px">
      {isDragActive && (
        // dark overlay when the user is dragging a file
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: '30%',
            zIndex: 100,
          }}
        />
      )}
      <input {...getInputProps()} />
      <MessageList members={members} messages={messages} />
      <Divider
        sx={{
          margin: '30px 16px 0px 16px',
          borderTop: '1px solid #E5E5E5',
        }}
      />
      <SendMessageForm members={members} onSend={sendMessage} openFilePicker={openFilePicker} />
      {fileHandlers.length > 0 && <FilePreviewsList fileHandlers={fileHandlers} removeFile={removeFile} />}
    </Stack>
  );
};

interface FilePreviewsListProps {
  fileHandlers: FileHandler[];
  removeFile: (fileId: string | number) => void;
}

const FilePreviewsList = ({ fileHandlers, removeFile }: FilePreviewsListProps) => {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap="16px"
      overflow="auto"
      maxHeight="30%"
      paddingX="16px"
      marginTop="12px" // spacing with the component on top
      paddingTop="4px" // spacing so "RemoveButton" are not cut
    >
      {fileHandlers.map((fileHandler) => (
        <FilePreviewRemovable
          key={fileHandler.id}
          remove={() => removeFile(fileHandler.id)}
          fileHandler={fileHandler}
          borderColor={'#005699' /* Should be same color as message bubble */}
        />
      ))}
    </Stack>
  );
};

const addMessage = (sortedMessages: Message[], message: Message) => {
  if (sortedMessages.length === 0) {
    return [message];
  } else if (message.id === sortedMessages[sortedMessages.length - 1].linearizedParent) {
    return [...sortedMessages, message];
  } else if (message.linearizedParent === sortedMessages[0].id) {
    return [message, ...sortedMessages];
  } else {
    console.error("Can't insert message " + message.id);
    return sortedMessages;
  }
};

const sortMessages = (messages: Message[]) => {
  let sortedMessages: Message[] = [];
  messages.forEach((message) => (sortedMessages = addMessage(sortedMessages, message)));
  return sortedMessages;
};

export default ChatInterface;
