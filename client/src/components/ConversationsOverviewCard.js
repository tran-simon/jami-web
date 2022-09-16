import React, { useEffect, useState } from 'react';
import { Card, CardActionArea, CardContent, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';

export default function ConversationsOverviewCard(props) {
  const navigate = useNavigate()
  const accountId = props.accountId || useParams().accountId
  const [state, setState] = useState({ loaded: false })

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}/conversations`, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        console.log(result)
        setState({ loaded: true, conversations: Object.values(result).map(c => Conversation.from(accountId, c)) })
      })
    return () => controller.abort()
  }, [accountId])

  return (
    <Card onClick={() => navigate(`/account/${accountId}`)} >
      <CardActionArea>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Conversations
          </Typography>
          <Typography gutterBottom variant="h5" component="h2">
            {state.loaded ? state.conversations.length : <CircularProgress size={24} />}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
