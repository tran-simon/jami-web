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
import { Card, CardActionArea, CardContent, CircularProgress, Typography } from '@mui/material';
import { IConversation } from 'jami-web-common';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuthContext } from '../contexts/AuthProvider';

export default function ConversationsOverviewCard() {
  const { axiosInstance, account } = useAuthContext();
  const navigate = useNavigate();

  const [conversationCount, setConversationCount] = useState<number | undefined>();

  const accountId = account.id;

  useEffect(() => {
    const controller = new AbortController();
    axiosInstance
      .get<IConversation[]>('/conversations', {
        signal: controller.signal,
      })
      .then(({ data }) => {
        console.log(data);
        setConversationCount(data.length);
      });
    return () => controller.abort(); // crash on React18
  }, [axiosInstance, accountId]);

  return (
    <Card onClick={() => navigate(`/`)}>
      <CardActionArea>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Conversations
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
            {conversationCount != null ? conversationCount : <CircularProgress size={24} />}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
