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
