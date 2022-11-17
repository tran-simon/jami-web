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
import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Conversation } from 'jami-web-common';
import { QRCodeCanvas } from 'qrcode.react';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthProvider';
import { setRefreshFromSlice } from '../redux/appSlice';
import { useAppDispatch } from '../redux/hooks';
import ConversationAvatar from './ConversationAvatar';
import {
  AudioCallIcon,
  BlockContactIcon,
  CancelIcon,
  ContactDetailsIcon,
  MessageIcon,
  RemoveContactIcon,
  VideoCallIcon,
} from './SvgIcon';

const cancelStyles: Modal.Styles = {
  content: {
    left: '94px',
    width: '300px',
    height: '220px',
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: '20px',
    opacity: '1',

    textAlign: 'left',
    font: 'normal normal normal 12px/26px Ubuntu',
    letterSpacing: '0px',
    color: '#000000',
  },
};

const contactDetailsStyles: Modal.Styles = {
  content: {
    left: '94px',
    width: '450px',
    height: '450px',
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: '20px',
    opacity: '1',

    textAlign: 'left',
    font: 'normal normal normal 12px/26px Ubuntu',
    letterSpacing: '0px',
    color: '#000000',
  },
};

const iconColor = '#005699';

type ConversationListItemProps = {
  conversation: Conversation;
};

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
  const { axiosInstance } = useAuthContext();
  const { conversationId, contactId } = useParams();
  const dispatch = useAppDispatch();

  const pathId = conversationId || contactId;
  const isSelected = conversation.getDisplayUri() === pathId;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [modalDetailsIsOpen, setModalDetailsIsOpen] = useState(false);
  const [modalDeleteIsOpen, setModalDeleteIsOpen] = useState(false);
  const [blockOrRemove, setBlockOrRemove] = useState(true);
  const [userId] = useState(conversation?.getFirstMember()?.contact.getUri());
  const [isSwarm] = useState(true);

  const openMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log(e);
    setMenuAnchorEl(e.currentTarget);
  };
  const openModalDetails = () => setModalDetailsIsOpen(true);
  const openModalDelete = () => setModalDeleteIsOpen(true);
  const closeModal = () => setMenuAnchorEl(null);
  const closeModalDetails = () => setModalDetailsIsOpen(false);
  const closeModalDelete = () => setModalDeleteIsOpen(false);

  const getContactDetails = async () => {
    const controller = new AbortController();
    try {
      const { data } = await axiosInstance.get(`/contacts/${userId}`, {
        signal: controller.signal,
      });
      console.log('CONTACT LIST - DETAILS: ', data);
    } catch (e) {
      console.log('ERROR GET CONTACT DETAILS: ', e);
    }
  };

  const removeOrBlock = async (block = false) => {
    setBlockOrRemove(false);

    const controller = new AbortController();
    let url = `/contacts/${userId}`;
    if (block) {
      url += '/block';
    }
    try {
      await axiosInstance(url, {
        signal: controller.signal,
        method: block ? 'POST' : 'DELETE',
      });
      dispatch(setRefreshFromSlice());
    } catch (e) {
      console.error(`Error ${block ? 'blocking' : 'removing'} contact : `, e);
      dispatch(setRefreshFromSlice());
    }
    closeModalDelete();
  };

  const uri = conversation.getId() ? `/conversation/${conversation.getId()}` : `/add-contact/${userId}`;
  return (
    <div onContextMenu={openMenu}>
      <div>
        <Menu open={!!menuAnchorEl} onClose={closeModal} anchorEl={menuAnchorEl}>
          <MenuItem
            onClick={() => {
              navigate(uri);
              closeModal();
            }}
          >
            <ListItemIcon>
              <MessageIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_message')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/account/call/${conversation.getId()}`);
            }}
          >
            <ListItemIcon>
              <AudioCallIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_start_audiocall')}</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate(`call/${conversation.getId()}?video=true`);
            }}
          >
            <ListItemIcon>
              <VideoCallIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_start_videocall')}</ListItemText>
          </MenuItem>

          {isSelected && (
            <MenuItem
              onClick={() => {
                navigate(`/`);
                closeModal();
              }}
            >
              <ListItemIcon>
                <CancelIcon style={{ color: iconColor }} />
              </ListItemIcon>
              <ListItemText>{t('conversation_close')}</ListItemText>
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              console.log('open details contact for: ');
              closeModal();
              openModalDetails();
              getContactDetails();
            }}
          >
            <ListItemIcon>
              <ContactDetailsIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_details')}</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setBlockOrRemove(true);
              closeModal();
              openModalDelete();
            }}
          >
            <ListItemIcon>
              <BlockContactIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_block_contact')}</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setBlockOrRemove(false);
              closeModal();
              openModalDelete();
            }}
          >
            <ListItemIcon>
              <RemoveContactIcon style={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>{t('conversation_delete_contact')}</ListItemText>
          </MenuItem>
        </Menu>
      </div>

      <div>
        <Modal
          isOpen={modalDetailsIsOpen}
          onRequestClose={closeModalDetails}
          style={contactDetailsStyles}
          contentLabel="Détails contact"
        >
          <Stack direction={'row'} alignContent="flex-end">
            <Stack direction={'column'}>
              <div style={{ height: '100px' }}>
                <ConversationAvatar displayName={conversation.getDisplayNameNoFallback()} />
              </div>

              <div
                style={{
                  fontSize: '20px',
                  marginBottom: '20px',
                  height: '20px',
                }}
              >
                Informations
              </div>

              <Typography variant="caption">Nom d&apos;utilisateur</Typography>
              <div style={{ height: '20px' }} />
              <Typography variant="caption">Identifiant </Typography>
              <div style={{ height: '20px' }} />

              <div
                style={{
                  flex: 1,
                  height: '150px',
                  flexDirection: 'column',
                  // alignSelf: "flex-end",
                }}
              >
                <Typography variant="caption">Code QR</Typography>
              </div>

              <Typography variant="caption">est un swarm </Typography>
            </Stack>

            <Stack direction={'column'}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '20px',
                  height: '100px',
                }}
              >
                {conversation.getDisplayNameNoFallback() + '(resolved name)'}
              </div>

              <div
                style={{
                  height: '40px',
                }}
              />
              <Typography variant="caption">
                <div style={{ fontWeight: 'bold' }}>{conversation.getDisplayNameNoFallback()}</div>
              </Typography>

              <div style={{ height: '20px' }} />

              <Typography variant="caption">
                <div style={{ fontWeight: 'bold' }}> {userId}</div>
              </Typography>

              <div style={{ height: '20px' }} />

              <div>
                <QRCodeCanvas size={40} value={`${userId}`} />
              </div>

              <Typography variant="caption">
                <div style={{ fontWeight: 'bold' }}> {String(isSwarm)}</div>
              </Typography>
            </Stack>
          </Stack>
          <div
            onClick={closeModalDetails}
            style={{
              width: '100px',
              borderStyle: 'solid',
              textAlign: 'center',
              borderRadius: '5px',
              marginLeft: '150px',
              marginTop: '10px',
            }}
          >
            <Typography variant="caption">Fermer</Typography>
          </div>
        </Modal>
      </div>

      <div>
        <Modal
          isOpen={modalDeleteIsOpen}
          onRequestClose={closeModalDelete}
          style={cancelStyles}
          contentLabel="Merci de confirmer"
        >
          <Typography variant="h4">Merci de confirmer</Typography>
          <Stack direction={'column'} justifyContent="space-around" spacing={'75px'}>
            <div style={{ textAlign: 'center', marginTop: '10%' }}>
              <Typography variant="body2">
                Voulez vous vraiment {blockOrRemove ? 'bloquer' : 'supprimer'} ce contact?
              </Typography>
            </div>

            <Stack direction={'row'} top={'25px'} alignSelf="center" spacing={1}>
              <Box
                onClick={() => {
                  if (blockOrRemove) removeOrBlock(true);
                  else removeOrBlock(false);
                }}
                style={{
                  width: '100px',
                  textAlign: 'center',
                  borderStyle: 'solid',
                  borderColor: 'red',
                  borderRadius: '10px',
                  color: 'red',
                }}
              >
                {blockOrRemove ? 'Bloquer' : 'Supprimer'}
              </Box>
              <Box
                onClick={closeModalDelete}
                style={{
                  width: '100px',
                  textAlign: 'center',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  borderStyle: 'solid',
                  borderRadius: '10px',
                }}
              >
                Annuler
              </Box>
            </Stack>
          </Stack>
        </Modal>
      </div>

      <ListItem button alignItems="flex-start" selected={isSelected} onClick={() => navigate(uri)}>
        <ListItemAvatar>
          <ConversationAvatar displayName={conversation.getDisplayNameNoFallback()} />
        </ListItemAvatar>
        <ListItemText primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
      </ListItem>
    </div>
  );
}
