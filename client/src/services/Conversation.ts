import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useConversationQuery = (accountId: string, conversationId: string) => {
  return useQuery(['conversation', accountId, conversationId], () => fetchConversation(accountId, conversationId), {
    enabled: !!(accountId && conversationId),
  });
};

export const useMessagesQuery = (accountId: string, conversationId: string) => {
  return useQuery(['messages', accountId, conversationId], () => fetchMessages(accountId, conversationId), {
    enabled: !!(accountId && conversationId),
  });
};

export const useSendMessageMutation = (accountId: string, conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    (message: string) => axios.post(`/api/accounts/${accountId}/conversations/${conversationId}`, { message }),
    {
      onSuccess: () => queryClient.invalidateQueries(['messages', accountId, conversationId]),
    }
  );
};

const fetchConversation = (accountId: string, conversationId: string) =>
  axios.get(`/api/accounts/${accountId}/conversations/${conversationId}`).then((result) => result.data);

const fetchMessages = (accountId: string, conversationId: string) =>
  axios.get(`/api/accounts/${accountId}/conversations/${conversationId}/messages`).then((result) => result.data);
