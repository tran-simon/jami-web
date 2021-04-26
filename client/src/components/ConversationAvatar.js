import React from 'react'
import { Avatar } from '@material-ui/core'
import { PersonRounded } from '@material-ui/icons'

export default function ConversationAvatar(props) {
  return <Avatar>
    {props.displayName ? props.displayName[0].toUpperCase() : <PersonRounded />}
  </Avatar>
}
