import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader, Switch, Typography, Grid, Paper, CardContent, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Toolbar, IconButton, ListItemAvatar, Input, TextField } from '@material-ui/core'
import { PhoneCallbackRounded, GroupRounded, DeleteRounded, AddCircle } from '@material-ui/icons'

import Account from '../../../model/Account'
import JamiIdCard from './JamiIdCard'
import ConversationAvatar from './ConversationAvatar'
import ConversationsOverviewCard from './ConversationsOverviewCard'

import authManager from '../AuthManager'

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
    flexGrow: 1
  },
  pos: {
    marginBottom: 12,
  },
  paper: {
    marginTop: 24,
    marginBottom: 24
  },
  textField: {
    //marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  }
}))

export default function AccountPreferences(props) {
  const classes = useStyles()
  const account = props.account
  const isJamiAccount = account.getType() === Account.TYPE_JAMI
  const alias = isJamiAccount ? "Jami account" : "SIP account"
  const moderators = account.getDefaultModerators()
  const [defaultModeratorUri, setDefaultModeratorUri] = useState('')

  const [details, setDetails] = useState(account.getDetails())

  const addModerator = () => {
    if (defaultModeratorUri) {
      authManager.fetch(`/api/accounts/${account.getId()}/defaultModerators/${defaultModeratorUri}`, {method: "PUT"})
      setDefaultModeratorUri('')
    }
  }

  const removeModerator = (uri) =>
    authManager.fetch(`/api/accounts/${account.getId()}/defaultModerators/${uri}`, {method: "DELETE"})

  const handleToggle = (key, value) => {
    console.log(`handleToggle ${key} ${value}`)
    const newDetails = {}
    newDetails[key] = value ? "true" : "false"
    console.log(newDetails)
    authManager.fetch(`/api/accounts/${account.getId()}`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDetails)
    })
    setDetails({...account.updateDetails(newDetails)})
  }

  return (
    <React.Fragment>
      <Typography variant="h2" component="h2" gutterBottom>{alias}</Typography>
      <Grid container spacing={3} style={{ marginBottom: 16 }}>
        {isJamiAccount &&
          <Grid item xs={12}><JamiIdCard account={account} /></Grid>}

        <Grid item xs={12} sm={6}>
          <ConversationsOverviewCard accountId={account.getId()} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Current calls
              </Typography>
              <Typography gutterBottom variant="h5" component="h2">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <List subheader={<ListSubheader>Settings</ListSubheader>}>
        <ListItem>
          <ListItemIcon>
            <GroupRounded />
          </ListItemIcon>
          <ListItemText id="switch-list-label-rendezvous" primary="Rendez-Vous point" />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={e => handleToggle('Account.rendezVous', e.target.checked)}
              checked={details['Account.rendezVous'] === 'true'}
              inputProps={{ 'aria-labelledby': 'switch-list-label-rendezvous' }}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <PhoneCallbackRounded />
          </ListItemIcon>
          <ListItemText id="switch-list-label-publicin" primary="Allow connection from unkown peers" />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={e => handleToggle('DHT.PublicInCalls', e.target.checked)}
              checked={details['DHT.PublicInCalls'] === 'true'}
              inputProps={{ 'aria-labelledby': 'switch-list-label-publicin' }}
            />
          </ListItemSecondaryAction>
        </ListItem>

        <Paper className={classes.paper}>
          <Toolbar>
            <Typography className={classes.title} variant="h6">
              Default moderators
          </Typography>
          </Toolbar>
          <List>
            <ListItem key="add">
              <TextField variant="outlined"
                className={classes.textField}
                value={defaultModeratorUri}
                onChange={e => setDefaultModeratorUri(e.target.value)}
                label="Add new default moderator"
                placeholder="Enter new moderator name or URI"
                fullWidth />
              <ListItemSecondaryAction>
                <IconButton onClick={addModerator}><AddCircle /></IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {!moderators || moderators.length === 0 ?
              <ListItem key="placeholder">
                <ListItemText primary="No default moderator" /></ListItem> :
              moderators.map((moderator) => (
                <ListItem key={moderator.uri}>
                  <ListItemAvatar>
                    <ConversationAvatar name={moderator.getDisplayName()} />
                  </ListItemAvatar>
                  <ListItemText primary={moderator.getDisplayName()} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={e => removeModerator(moderator.uri)}><DeleteRounded /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </Paper>
      </List>

    </React.Fragment>)
}
