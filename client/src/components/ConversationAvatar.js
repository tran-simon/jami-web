import { Avatar } from '@mui/material'

export default function ConversationAvatar({displayName,...props}) {
  return <Avatar
    {...props}
    alt={displayName}
    src="/broken"
  />
}
