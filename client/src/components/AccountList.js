import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import PersonRoundedIcon from '@material-ui/icons/PersonRounded';

class AccountList extends React.Component {
  render() {
    return (
        <List>
          {
            this.props.accounts.map(account => <ListItem button key={account.getId()} onClick={() => this.props.onClick(account)}>
              <ListItemAvatar>
                <Avatar>
                  <PersonRoundedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={account.getDisplayName()} secondary={account.getDisplayUri()} />
            </ListItem>
            )
          }
        </List>)
  }
}

export default AccountList;