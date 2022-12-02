/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { Box, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { ContactDetails } from 'jami-web-common';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthProvider';
import { CallManagerContext } from '../contexts/CallManagerProvider';
import { useConversationContext } from '../contexts/ConversationProvider';
import { MessengerContext } from '../contexts/MessengerProvider';
import { Conversation } from '../models/conversation';
import { setRefreshFromSlice } from '../redux/appSlice';
import { useAppDispatch } from '../redux/hooks';
import ContextMenu, { ContextMenuHandler, useContextMenuHandler } from './ContextMenu';
import ConversationAvatar from './ConversationAvatar';
import { ConfirmationDialog, DialogContentList, InfosDialog, useDialogHandler } from './Dialog';
import { PopoverListItemData } from './PopoverList';
import {
  AudioCallIcon,
  BlockContactIcon,
  CancelIcon,
  ContactDetailsIcon,
  MessageIcon,
  RemoveContactIcon,
  VideoCallIcon,
} from './SvgIcon';

type ConversationListItemProps = {
  conversation: Conversation;
};

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
  const conversationContext = useConversationContext(true);
  const conversationId = conversationContext?.conversationId;
  const contextMenuHandler = useContextMenuHandler();
  const { newContactId, setNewContactId } = useContext(MessengerContext);

  const pathId = conversationId ?? newContactId;
  const isSelected = conversation.getDisplayUri() === pathId;

  const navigate = useNavigate();
  const userId = conversation?.getFirstMember()?.contact.uri;

  const onClick = useCallback(() => {
    const newConversationId = conversation.id;
    if (newConversationId) {
      navigate(`/conversation/${newConversationId}`);
    } else {
      setNewContactId(userId);
    }
  }, [navigate, conversation, userId, setNewContactId]);

  return (
    <Box onContextMenu={contextMenuHandler.handleAnchorPosition}>
      <ConversationMenu
        userId={userId}
        conversation={conversation}
        onMessageClick={onClick}
        isSelected={isSelected}
        contextMenuProps={contextMenuHandler.props}
      />
      <ListItem button alignItems="flex-start" selected={isSelected} onClick={onClick}>
        <ListItemAvatar>
          <ConversationAvatar displayName={conversation.getDisplayNameNoFallback()} />
        </ListItemAvatar>
        <ListItemText primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
      </ListItem>
    </Box>
  );
}

interface ConversationMenuProps {
  userId: string;
  conversation: Conversation;
  onMessageClick: () => void;
  isSelected: boolean;
  contextMenuProps: ContextMenuHandler['props'];
}

const ConversationMenu = ({
  userId,
  conversation,
  onMessageClick,
  isSelected,
  contextMenuProps,
}: ConversationMenuProps) => {
  const { t } = useTranslation();
  const { axiosInstance } = useAuthContext();
  const { startCall } = useContext(CallManagerContext);
  const [isSwarm] = useState(true);

  const detailsDialogHandler = useDialogHandler();
  const blockContactDialogHandler = useDialogHandler();
  const removeContactDialogHandler = useDialogHandler();

  const navigate = useNavigate();

  const getContactDetails = useCallback(async () => {
    const controller = new AbortController();
    try {
      const { data } = await axiosInstance.get<ContactDetails>(`/contacts/${userId}`, {
        signal: controller.signal,
      });
      console.log('CONTACT LIST - DETAILS: ', data);
    } catch (e) {
      console.log('ERROR GET CONTACT DETAILS: ', e);
    }
  }, [axiosInstance, userId]);

  const conversationId = conversation.id;

  const menuOptions: PopoverListItemData[] = useMemo(
    () => [
      {
        label: t('conversation_message'),
        Icon: MessageIcon,
        onClick: onMessageClick,
      },
      {
        label: t('conversation_start_audiocall'),
        Icon: AudioCallIcon,
        onClick: () => {
          if (conversationId) {
            startCall({
              conversationId,
              role: 'caller',
            });
          }
        },
      },
      {
        label: t('conversation_start_videocall'),
        Icon: VideoCallIcon,
        onClick: () => {
          if (conversationId) {
            startCall({
              conversationId,
              role: 'caller',
              withVideoOn: true,
            });
          }
        },
      },
      ...(isSelected
        ? [
            {
              label: t('conversation_close'),
              Icon: CancelIcon,
              onClick: () => {
                navigate(`/`);
              },
            },
          ]
        : []),
      {
        label: t('conversation_details'),
        Icon: ContactDetailsIcon,
        onClick: () => {
          detailsDialogHandler.openDialog();
          getContactDetails();
        },
      },
      {
        label: t('conversation_block'),
        Icon: BlockContactIcon,
        onClick: () => {
          blockContactDialogHandler.openDialog();
        },
      },
      {
        label: t('conversation_delete'),
        Icon: RemoveContactIcon,
        onClick: () => {
          removeContactDialogHandler.openDialog();
        },
      },
    ],
    [
      navigate,
      onMessageClick,
      isSelected,
      getContactDetails,
      detailsDialogHandler,
      blockContactDialogHandler,
      removeContactDialogHandler,
      t,
      startCall,
      conversationId,
    ]
  );

  return (
    <>
      <ContextMenu {...contextMenuProps} items={menuOptions} />

      <DetailsDialog {...detailsDialogHandler.props} userId={userId} conversation={conversation} isSwarm={isSwarm} />

      <RemoveContactDialog {...removeContactDialogHandler.props} userId={userId} conversation={conversation} />

      <BlockContactDialog {...blockContactDialogHandler.props} userId={userId} conversation={conversation} />
    </>
  );
};

interface DetailsDialogProps {
  userId: string;
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
  isSwarm: boolean;
}

const DetailsDialog = ({ userId, conversation, open, onClose, isSwarm }: DetailsDialogProps) => {
  const { t } = useTranslation();
  const items = useMemo(
    () => [
      {
        label: t('conversation_details_username'),
        value: conversation.getDisplayNameNoFallback(),
      },
      {
        label: t('conversation_details_identifier'),
        value: userId,
      },
      {
        label: t('conversation_details_qr_code'),
        value: <QRCodeCanvas size={80} value={`${userId}`} />,
      },
      {
        label: t('conversation_details_is_swarm'),
        value: isSwarm ? t('conversation_details_is_swarm_true') : t('conversation_details_is_swarm_false'),
      },
    ],
    [userId, conversation, isSwarm, t]
  );
  return (
    <InfosDialog
      open={open}
      onClose={onClose}
      icon={
        <ConversationAvatar
          sx={{ width: 'inherit', height: 'inherit' }}
          displayName={conversation.getDisplayNameNoFallback()}
        />
      }
      title={conversation.getDisplayNameNoFallback() || ''}
      content={<DialogContentList title={t('conversation_details_informations')} items={items} />}
    />
  );
};

interface BlockContactDialogProps {
  userId: string;
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
}

const BlockContactDialog = ({ userId, open, onClose }: BlockContactDialogProps) => {
  const { axiosInstance } = useAuthContext();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const block = async () => {
    const controller = new AbortController();
    try {
      await axiosInstance.post(`/contacts/${userId}/block`, {
        signal: controller.signal,
      });
      dispatch(setRefreshFromSlice());
    } catch (e) {
      console.error(`Error $block contact : `, e);
      dispatch(setRefreshFromSlice());
    }
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title={t('dialog_confirm_title_default')}
      content={t('conversation_ask_confirm_block')}
      onConfirm={block}
      confirmButtonText={t('conversation_confirm_block')}
    />
  );
};

interface RemoveContactDialogProps {
  userId: string;
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
}

const RemoveContactDialog = ({ userId, open, onClose }: RemoveContactDialogProps) => {
  const { axiosInstance } = useAuthContext();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const remove = async () => {
    const controller = new AbortController();
    try {
      await axiosInstance.delete(`/contacts/${userId}`, {
        signal: controller.signal,
      });
      dispatch(setRefreshFromSlice());
    } catch (e) {
      console.error(`Error removing contact : `, e);
      dispatch(setRefreshFromSlice());
    }
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title={t('dialog_confirm_title_default')}
      content={t('conversation_ask_confirm_remove')}
      onConfirm={remove}
      confirmButtonText={t('conversation_confirm_remove')}
    />
  );
};
