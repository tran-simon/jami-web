import { Avatar, AvatarProps } from '@mui/material';

type ConversationAvatarProps = AvatarProps & {
  displayName?: string;
};
export default function ConversationAvatar({ displayName, ...props }: ConversationAvatarProps) {
  return <Avatar {...props} alt={displayName} src="/broken" />;
}
