import { Card, CardActionArea, CardContent, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import Conversation from '../../../model/Conversation';
import authManager from '../AuthManager';

export default function ConversationsOverviewCard(props) {
  const navigate = useNavigate();
  const accountId = props.accountId || useParams().accountId;
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
    <Card onClick={() => navigate(`/account/${accountId}`)}>
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
