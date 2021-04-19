import React from 'react'
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import { PersonRounded } from '@material-ui/icons';

export default function AccountList(props) {
  return <List>
    {
      props.accounts.map(account => {
        const displayName = account.getDisplayNameNoFallback()
        return <ListItem button key={account.getId()} onClick={() => props.onClick(account)}>
          <ListItemAvatar>
            <Avatar>{displayName ? displayName[0].toUpperCase() : <PersonRounded />}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={account.getDisplayName()} secondary={account.getDisplayUri()} />
        </ListItem>
      })
    }
  </List>
}
