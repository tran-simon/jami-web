import React from 'react';
import { useNavigate } from "react-router-dom";

import { Box, Container, Fab, Card, CardContent, Typography } from '@mui/material';
import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import makeStyles from '@mui/styles/makeStyles';
import authManager from '../AuthManager'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}))

export default function AddContactPage(props) {
  const classes = useStyles()
  const navigate = useNavigate();
  const accountId = props.accountId || props.match.params.accountId
  const contactId = props.contactId || props.match.params.contactId

  const handleClick = async e => {
    const response = await authManager.fetch(`/api/accounts/${accountId}/conversations`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({members:[contactId]})
    }).then(res => res.json())

    console.log(response)
    if (response.conversationId) {
      navigate(`/account/${accountId}/conversation/${response.conversationId}`)
    }
  }

  return (
    <Container className='messenger'>
      <Card variant='outlined' style={{ borderRadius: 16, maxWidth: 560, margin: "16px auto" }}>
        <CardContent>
          <Typography variant='h6'>Jami key ID</Typography>
          <Typography variant='body1'>{contactId}</Typography>
          <Box style={{textAlign: 'center', marginTop: 16}}>
          <Fab variant='extended' color='primary' onClick={handleClick}>
            <GroupAddRounded className={classes.extendedIcon} />
            Add contact
          </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>)
}
