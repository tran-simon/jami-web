import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader, Switch, Typography, Grid, Paper, CardContent, Card } from '@material-ui/core';
import { PhoneCallbackRounded, GroupRounded } from '@material-ui/icons';

import JamiIdCard from './JamiIdCard';
import Account from '../../../model/Account';
import ConversationsOverviewCard from './ConversationsOverviewCard';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const columns = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'code', label: 'ISO\u00a0Code', minWidth: 100 },
  {
    id: 'population',
    label: 'Population',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'size',
    label: 'Size\u00a0(km\u00b2)',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'density',
    label: 'Density',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toFixed(2),
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData('India', 'IN', 1324171354, 3287263),
  createData('China', 'CN', 1403500365, 9596961),
  createData('Italy', 'IT', 60483973, 301340),
  createData('United States', 'US', 327167434, 9833520),
  createData('Canada', 'CA', 37602103, 9984670),
  createData('Australia', 'AU', 25475400, 7692024),
  createData('Germany', 'DE', 83019200, 357578),
  createData('Ireland', 'IE', 4857000, 70273),
  createData('Mexico', 'MX', 126577691, 1972550),
  createData('Japan', 'JP', 126317000, 377973),
  createData('France', 'FR', 67022000, 640679),
  createData('United Kingdom', 'GB', 67545757, 242495),
  createData('Russia', 'RU', 146793744, 17098246),
  createData('Nigeria', 'NG', 200962417, 923768),
  createData('Brazil', 'BR', 210147125, 8515767),
];

export default function AccountPreferences(props) {
  const classes = useStyles()
  const account = props.account
  const isJamiAccount = account.getType() === Account.TYPE_JAMI
  const alias = isJamiAccount ? "Jami account" : "SIP account"
  return (
    <React.Fragment>
      <Typography variant="h2" component="h2" gutterBottom>{alias}</Typography>
      <Grid container spacing={3} style={{marginBottom: 16}}>
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
              /*onChange={handleToggle('wifi')}*/
              checked={account.isRendezVous()}
              inputProps={{ 'aria-labelledby': 'switch-list-label-wifi' }}
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
              /*onChange={handleToggle('bluetooth')}*/
              checked={account.isPublicIn()}
              inputProps={{ 'aria-labelledby': 'switch-list-label-bluetooth' }}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>





    </React.Fragment>)
}
