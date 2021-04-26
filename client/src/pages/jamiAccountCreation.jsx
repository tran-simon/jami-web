import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, Fab, CardActions, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AddRounded } from '@material-ui/icons';
import UsernameChooser from '../components/UsernameChooser';
import authManager from '../AuthManager'
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  wizardCard: {
    borderRadius: 8,
    maxWidth: 360,
    margin: "16px auto"
  },
  actionArea: {
    textAlign: 'center',
    display: 'block'
  },
  chooser: {
    marginTop: 16
  }
}))

export default function JamiAccountDialog(props) {
  const classes = useStyles()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const history = useHistory()

  const onSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    const result = await authManager.fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'Account.registeredName': name
      })
    })
      .then(res => res.json())
      .catch(error => {
        setLoading(false)
        setError(error)
      })
    console.log(result)
    if (result && result.accountId)
      history.replace(`/account/${result.accountId}/settings`)
  }

  return (
    <Container>
      <Card component="form" onSubmit={onSubmit} className={classes.wizardCard}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Create Jami account
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Welcome to the Jami web node setup.<br />
            Let's start by creating a new administrator account to control access to the server configuration.
          </Typography>

          <Box className={classes.chooser} >
            <UsernameChooser disabled={loading} setName={setName} />
          </Box>
        </CardContent>
        <CardActions className={classes.actionArea}>
          {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
          <Fab color="primary" type="submit" variant="extended" disabled={!name || loading}>
            <AddRounded className={classes.extendedIcon} />
            Register name
          </Fab>
        </CardActions>
      </Card>
    </Container>)
}
