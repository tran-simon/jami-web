import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import ConversationAvatar from './ConversationAvatar'

export default function AccountList(props) {
  return <List>
    {
      props.accounts.map(account => {
        const displayName = account.getDisplayNameNoFallback()
        return <ListItem button key={account.getId()} onClick={() => props.onClick(account)}>
          <ListItemAvatar>
            <ConversationAvatar displayName={displayName} />
          </ListItemAvatar>
          <ListItemText primary={account.getDisplayName()} secondary={account.getDisplayUri()} />
        </ListItem>
      })
    }
  </List>
}
