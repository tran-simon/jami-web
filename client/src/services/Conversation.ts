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

import { useAuthContext } from '../contexts/AuthProvider';
import { apiUrl } from '../utils/constants';

export const useConversationQuery = (conversationId: string) => {
  const { token } = useAuthContext();
  return useQuery(['conversation', conversationId], () => fetchConversation(conversationId, token), {
    enabled: !!conversationId,
  });
};

export const useMessagesQuery = (conversationId: string) => {
  const { token } = useAuthContext();
  return useQuery(['messages', conversationId], () => fetchMessages(conversationId, token), {
    enabled: !!conversationId,
  });
};

export const useSendMessageMutation = (conversationId: string) => {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation(
    (message: string) =>
      axios.post(
        new URL(`/conversations/${conversationId}/messages`, apiUrl).toString(),
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    {
      onSuccess: () => queryClient.invalidateQueries(['messages', conversationId]),
    }
  );
};

const fetchConversation = (conversationId: string, token: string) =>
  axios
    .get(new URL(`/conversations/${conversationId}`, apiUrl).toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((result) => result.data);

const fetchMessages = (conversationId: string, token: string) =>
  axios
    .get(new URL(`/conversations/${conversationId}/messages`, apiUrl).toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((result) => result.data);
