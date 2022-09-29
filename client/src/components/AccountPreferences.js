import { AddCircle, DeleteRounded, GroupRounded, PhoneCallbackRounded } from '@mui/icons-material';
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Paper,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import ConversationAvatar from './ConversationAvatar';
import ConversationsOverviewCard from './ConversationsOverviewCard';
import JamiIdCard from './JamiIdCard';

const transition = { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] };

const thumbnailVariants = {
  initial: { scale: 0.9, opacity: 0 },
  enter: { scale: 1, opacity: 1, transition },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 1.5, ...transition },
  },
};

export default function AccountPreferences(props) {
  const account = props.account;
  let devices = [];
  for (var i in account.devices) devices.push([i, account.devices[i]]);

  console.log(devices);

  const isJamiAccount = account.getType() === Account.TYPE_JAMI;
  const alias = isJamiAccount ? 'Jami account' : 'SIP account';
  const moderators = account.getDefaultModerators();
  const [defaultModeratorUri, setDefaultModeratorUri] = useState('');

  const [details, setDetails] = useState(account.getDetails());

  const addModerator = () => {
    if (defaultModeratorUri) {
      authManager.fetch(`/api/accounts/${account.getId()}/defaultModerators/${defaultModeratorUri}`, { method: 'PUT' });
      setDefaultModeratorUri('');
    }
  };

  const removeModerator = (uri) =>
    authManager.fetch(`/api/accounts/${account.getId()}/defaultModerators/${uri}`, { method: 'DELETE' });

  const handleToggle = (key, value) => {
    console.log(`handleToggle ${key} ${value}`);
    const newDetails = {};
    newDetails[key] = value ? 'true' : 'false';
    console.log(newDetails);
    authManager.fetch(`/api/accounts/${account.getId()}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDetails),
    });
    setDetails({ ...account.updateDetails(newDetails) });
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        enter: { transition: { staggerChildren: 0.05 } },
        exit: { transition: { staggerChildren: 0.02 } },
      }}
    >
      <motion.div variants={thumbnailVariants}>
        <Typography variant="h2" component="h2" gutterBottom>
          {alias}
        </Typography>
      </motion.div>
      <Grid container spacing={3} style={{ marginBottom: 16 }}>
        {isJamiAccount && (
          <Grid item xs={12}>
            <motion.div variants={thumbnailVariants}>
              <JamiIdCard account={account} />
            </motion.div>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <motion.div variants={thumbnailVariants}>
            <ConversationsOverviewCard accountId={account.getId()} />
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6}>
          <motion.div variants={thumbnailVariants}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Current calls
                </Typography>
                <Typography gutterBottom variant="h5" component="h2">
                  0
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6}>
          <motion.div variants={thumbnailVariants}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Appareils associés
                </Typography>
                <Typography gutterBottom variant="h5" component="h2">
                  {devices.map((device) => (
                    <ListItem>
                      <GroupRounded />
                      <ListItemText id="switch-list-label-rendezvous" primary={device[1]} secondary={device[0]} />
                    </ListItem>
                  ))}
                  {/* <ListItemTextsion> */}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <List
        subheader={
          <motion.div variants={thumbnailVariants}>
            <ListSubheader>Settings</ListSubheader>
          </motion.div>
        }
      >
        <motion.div variants={thumbnailVariants}>
          <ListItem>
            <ListItemIcon>
              <GroupRounded />
            </ListItemIcon>
            <ListItemText id="switch-list-label-rendezvous" primary="Rendez-Vous point" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={(e) => handleToggle('Account.rendezVous', e.target.checked)}
                checked={details['Account.rendezVous'] === 'true'}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-rendezvous',
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </motion.div>
        <motion.div variants={thumbnailVariants}>
          <ListItem>
            <ListItemIcon>
              <PhoneCallbackRounded />
            </ListItemIcon>
            <ListItemText id="switch-list-label-publicin" primary="Allow connection from unkown peers" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={(e) => handleToggle('DHT.PublicInCalls', e.target.checked)}
                checked={details['DHT.PublicInCalls'] === 'true'}
                inputProps={{ 'aria-labelledby': 'switch-list-label-publicin' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </motion.div>
        <motion.div variants={thumbnailVariants}>
          <Paper>
            <Toolbar>
              <Typography variant="h6">Default moderators</Typography>
            </Toolbar>
            <List>
              <ListItem key="add">
                <TextField
                  variant="outlined"
                  value={defaultModeratorUri}
                  onChange={(e) => setDefaultModeratorUri(e.target.value)}
                  label="Add new default moderator"
                  placeholder="Enter new moderator name or URI"
                  fullWidth
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={addModerator} size="large">
                    <AddCircle />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {!moderators || moderators.length === 0 ? (
                <ListItem key="placeholder">
                  <ListItemText primary="No default moderator" />
                </ListItem>
              ) : (
                moderators.map((moderator) => (
                  <ListItem key={moderator.uri}>
                    <ListItemAvatar>
                      <ConversationAvatar name={moderator.getDisplayName()} />
                    </ListItemAvatar>
                    <ListItemText primary={moderator.getDisplayName()} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={(e) => removeModerator(moderator.uri)} size="large">
                        <DeleteRounded />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </motion.div>
      </List>
    </motion.div>
  );
}
