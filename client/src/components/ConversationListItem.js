import { Box, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';

import Conversation from '../../../model/Conversation';
import { setRefreshFromSlice } from '../../redux/appSlice';
import { useAppDispatch } from '../../redux/hooks';
import authManager from '../AuthManager';
import ConversationAvatar from './ConversationAvatar';
import { RemoveContactIcon, VideoCallIcon } from './SvgIcon.tsx';
import { AudioCallIcon, BlockContactIcon, ContactDetailsIcon, CrossIcon, MessageIcon } from './SvgIcon.tsx';

const customStyles = {
  content: {
    // right: "auto",
    // bottom: "auto",
    // // marginRight: "-50%",
    // transform: "translate(-50%, -50%)",
    // padding: "16px"

    // top: "1364px",
    left: '94px',
    width: '180px',
    height: '262px',
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '3px 3px 7px #00000029',
    borderRadius: '5px 20px 20px 20px',
    opacity: '1',

    textAlign: 'left',
    font: 'normal normal normal 12px/26px Ubuntu',
    letterSpacing: '0px',
    color: '#000000',
  },
};

const cancelStyles = {
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

const contactDetailsStyles = {
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

const stackStyles = {
  flexDirection: 'row',
  marginBottom: '4px',
  spacing: '40px',
  flex: 1,
  alignItems: 'center',
};

const iconTextStyle = {
  marginRight: '10px',
};

const iconColor = '#005699';

export default function ConversationListItem(props) {
  const { conversationId, contactId } = useParams();
  const dispatch = useAppDispatch();

  const conversation = props.conversation;

  const pathId = conversationId || contactId;
  const isSelected = conversation.getDisplayUri() === pathId;
  const navigate = useNavigate();

  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalDetailsIsOpen, setModalDetailsIsOpen] = useState(false);
  const [modalDeleteIsOpen, setModalDeleteIsOpen] = useState(false);
  const [blockOrRemove, setBlockOrRemove] = useState(true);
  const [userId, setUserId] = useState(conversation?.getFirstMember()?.contact.getUri());
  const [isSwarm, setIsSwarm] = useState('true');

  const openModal = (e) => {
    e.preventDefault();
    console.log(e);
    setIsOpen(true);
  };
  const openModalDetails = () => setModalDetailsIsOpen(true);
  const openModalDelete = () => setModalDeleteIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const closeModalDetails = () => setModalDetailsIsOpen(false);
  const closeModalDelete = () => setModalDeleteIsOpen(false);

  let subtitle;
  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  const getContactDetails = () => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${conversation.getAccountId()}/contacts/details/${userId}`, {
        signal: controller.signal,
      })
      .then((res) => res.json())
      .then((result) => {
        console.log('CONTACT LIST - DETAILS: ', result);
      })
      .catch((e) => console.log('ERROR GET CONTACT DETAILS: ', e));
  };

  const removeOrBlock = (typeOfRemove) => {
    console.log(typeOfRemove);
    setBlockOrRemove(false);

    console.log('EEEH', typeOfRemove, conversation.getAccountId(), userId);

    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${conversation.getAccountId()}/contacts/${typeOfRemove}/${userId}`, {
        signal: controller.signal,
        method: 'DELETE',
      })
      .then((res) => res.json())
      .then((result) => {
        console.log('propre');
        dispatch(setRefreshFromSlice());
      })
      .catch((e) => {
        console.log(`ERROR ${typeOfRemove}ing CONTACT : `, e);
        dispatch(setRefreshFromSlice());
      });
    closeModalDelete();
  };

  const uri = conversation.getId() ? `conversation/${conversation.getId()}` : `addContact/${userId}`;
  if (conversation instanceof Conversation) {
    return (
      <div onContextMenu={openModal}>
        <div name="Modal conversation">
          <Modal
            isOpen={modalIsOpen}
            //   onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <Stack
              onClick={() => {
                navigate(`/account/${conversation.getAccountId()}/${uri}`);
                closeModal();
              }}
              {...stackStyles}
            >
              <div style={{ ...iconTextStyle }}>
                <MessageIcon style={{ color: iconColor }} />
              </div>
              Message
            </Stack>
            <Stack {...stackStyles}>
              <div style={{ ...iconTextStyle }}>
                <AudioCallIcon style={{ color: iconColor }} />
              </div>
              Démarrer appel audio
            </Stack>

            <Stack {...stackStyles}>
              <div style={{ ...iconTextStyle }}>
                <VideoCallIcon style={{ color: iconColor }} />
              </div>
              Démarrer appel vidéo
            </Stack>

            <Stack
              {...stackStyles}
              onClick={() => {
                navigate(`/account/${conversation.getAccountId()}/`);
                closeModal();
              }}
            >
              <div style={{ ...iconTextStyle }}>
                <CrossIcon style={{ color: iconColor }} />
              </div>
              Fermer la conversation
            </Stack>

            <Stack
              onClick={() => {
                console.log('open details contact for: ');
                closeModal();
                openModalDetails();
                getContactDetails();
              }}
              {...stackStyles}
            >
              <div style={{ ...iconTextStyle }}>
                <ContactDetailsIcon style={{ color: iconColor }} />
              </div>
              Détails de la conversation
            </Stack>

            <Stack
              onClick={() => {
                setBlockOrRemove(true);
                closeModal();
                openModalDelete();
              }}
              {...stackStyles}
            >
              <div style={{ ...iconTextStyle }}>
                <BlockContactIcon style={{ color: iconColor }} />
              </div>
              Bloquer le contact
            </Stack>

            <Stack
              onClick={() => {
                setBlockOrRemove(false);
                closeModal();
                openModalDelete();
              }}
              {...stackStyles}
            >
              <div style={{ ...iconTextStyle }}>
                <RemoveContactIcon style={{ color: iconColor }} />
              </div>
              Supprimer contact
            </Stack>
          </Modal>
        </div>

        <div name="Contact details">
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
                    direction: 'column',
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

                <div height={'40px'}>
                  <QRCodeCanvas value={`${userId}`} />
                </div>

                <Typography variant="caption">
                  <div style={{ fontWeight: 'bold' }}> {isSwarm}</div>
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

        <div name="Remove or block details">
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
                    if (blockOrRemove) removeOrBlock('block');
                    else removeOrBlock('remove');
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

        <ListItem
          button
          alignItems="flex-start"
          selected={isSelected}
          onClick={() => navigate(`/account/${conversation.getAccountId()}/${uri}`)}
        >
          <ListItemAvatar>
            <ConversationAvatar displayName={conversation.getDisplayNameNoFallback()} />
          </ListItemAvatar>
          <ListItemText primary={conversation.getDisplayName()} secondary={conversation.getDisplayUri()} />
        </ListItem>
      </div>
    );
  } else return null;
}
