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
import { Conversation } from 'jami-web-common';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import authManager from '../AuthManager';

export default function ConversationsOverviewCard(props) {
  const navigate = useNavigate();
  let accountId = useParams().accountId;
  if (props.accountId) {
    accountId = props.accountId;
  }
  const [loaded, setLoaded] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/conversations`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setLoaded(true);
        setConversations(Object.values(result).map((c) => Conversation.from(accountId, c)));
      });
    // return () => controller.abort() // crash on React18
  }, [accountId]);

  return (
    <Card onClick={() => navigate(`/deprecated-account/${accountId}`)}>
      <CardActionArea>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Conversations
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
            {loaded ? conversations.length : <CircularProgress size={24} />}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
