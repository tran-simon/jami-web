import React, { useEffect, useState } from 'react';
import { Box, Card, CardActionArea, CardContent, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';

const useStyles = makeStyles({
  title: {
    fontSize: 14,
  }, pos: {
    fontSize: 14,
  }
});

export default function ConversationsOverviewCard(props) {
  const classes = useStyles()
  const history = useHistory()
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
    <Card onClick={() => history.push(`/account/${accountId}`)} >
      <CardActionArea>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
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
