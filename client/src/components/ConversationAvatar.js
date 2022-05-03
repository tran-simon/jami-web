import React from 'react'
import { Avatar } from '@mui/material'
import { PersonRounded } from '@mui/icons-material'

export default function ConversationAvatar(props) {
  return <Avatar>
    {props.displayName ? props.displayName[0].toUpperCase() : <PersonRounded />}
  </Avatar>
}
