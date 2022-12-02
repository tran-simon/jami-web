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
import { useMemo } from 'react';

import { useAuthContext } from '../contexts/AuthProvider';
import { Conversation } from '../models/Conversation';

export const useConversationQuery = (conversationId?: string) => {
  const { axiosInstance, accountId } = useAuthContext();
  const conversationQuery = useQuery(
    ['conversation', conversationId],
    async () => {
      const { data } = await axiosInstance.get(`/conversations/${conversationId}`);
      return data;
    },
    {
      enabled: !!conversationId,
    }
  );

  const conversation = useMemo(() => {
    if (conversationQuery.isSuccess) {
      return Conversation.from(accountId, conversationQuery.data);
    }
  }, [accountId, conversationQuery.isSuccess, conversationQuery.data]);

  return {
    conversation,
    ...conversationQuery,
  };
};

export const useMessagesQuery = (conversationId: string) => {
  const { axiosInstance } = useAuthContext();
  return useQuery(
    ['messages', conversationId],
    async () => {
      const { data } = await axiosInstance.get(`/conversations/${conversationId}/messages`);
      return data;
    },
    {
      enabled: !!conversationId,
    }
  );
};

export const useSendMessageMutation = (conversationId: string) => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation(
    (message: string) => axiosInstance.post(`/conversations/${conversationId}/messages`, { message }),
    {
      onSuccess: () => queryClient.invalidateQueries(['messages', conversationId]),
    }
  );
};
