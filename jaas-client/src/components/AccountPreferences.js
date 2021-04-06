import React from 'react';

import Typography from '@material-ui/core/Typography';

import JamiIdCard from './JamiIdCard';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import Account from '../../../model/Account';

class AccountPreferences extends React.Component {

  render() {
    const account = this.props.account
    const isJamiAccount = account.getType() === Account.TYPE_JAMI
    return (
      <React.Fragment>
        <Typography variant="h2" component="h2">Jami account</Typography>

        {isJamiAccount &&
          <JamiIdCard account={account} />}

        <List subheader={<ListSubheader>Settings</ListSubheader>}>
          <ListItem>
            <ListItemIcon>
              <GroupRoundedIcon />
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
              <PhoneCallbackIcon />
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
}

export default AccountPreferences;