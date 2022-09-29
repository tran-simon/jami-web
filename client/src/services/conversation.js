import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useConversationQuery = (accountId, conversationId) => {
  return useQuery(['conversation', accountId, conversationId], () => fetchConversation(accountId, conversationId), {
    enabled: !!(accountId && conversationId),
  });
};

export const useMessagesQuery = (accountId, conversationId) => {
  return useQuery(['messages', accountId, conversationId], () => fetchMessages(accountId, conversationId), {
    enabled: !!(accountId && conversationId),
  });
};

export const useSendMessageMutation = (accountId, conversationId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (message) => axios.post(`/api/accounts/${accountId}/conversations/${conversationId}`, { message }),
    {
      onSuccess: () => queryClient.invalidateQueries(['messages', accountId, conversationId]),
    }
  );
};

const fetchConversation = (accountId, conversationId) =>
  axios.get(`/api/accounts/${accountId}/conversations/${conversationId}`).then((result) => result.data);

const fetchMessages = (accountId, conversationId) =>
  axios.get(`/api/accounts/${accountId}/conversations/${conversationId}/messages`).then((result) => result.data);
