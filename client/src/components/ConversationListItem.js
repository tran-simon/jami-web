import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import authManager from '../AuthManager'
import ConversationAvatar from './ConversationAvatar'
import Conversation from '../../../model/Conversation'
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { Person } from "@mui/icons-material";
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { Button, Stack, Switch, ThemeProvider, Typography } from "@mui/material"
import { CloseButton } from './buttons';
import { AudioCallIcon, BlockContactIcon, ContactDetailsIcon, CrossIcon, MessageIcon, RemoveContactIcon, VideoCallIcon } from './svgIcons';

const customStyles = {
  content: {
    // top: "50%",
    // left: "50%",
    // right: "auto",
    // bottom: "auto",
    // // marginRight: "-50%",
    // transform: "translate(-50%, -50%)",
    // borderRadius: "5px 20px 20px 5px",
    // boxShadow; ""
    // fontSize: "12px",
    // padding: "16px"

    // top: "1364px",
    left: "94px",
    width: "164px",
    height: "262px",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "3px 3px 7px #00000029",
    borderRadius: "5px 20px 20px 20px",
    opacity: "1",

    textAlign: "left",
    font: "normal normal normal 12px/36px Ubuntu",
    letterSpacing: "0px",
    color: "#000000",
  },
};

const stackStyles = {
  flexDirection: "row",
  marginBottom: "5px",
  // spacing: "10px",
  flex: 1,
  alignItems: "center",
  // justifyContent: "space-around"
};

export default function ConversationListItem(props) {
  const { conversationId, contactId } = useParams();
  const conversation = props.conversation;
  console.log(
    "XXX",
    conversation,
    conversation.id,
    conversation.getAccountId()
  );

  const pathId = conversationId || contactId;
  const isSelected = conversation.getDisplayUri() === pathId;
  const navigate = useNavigate();

  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalDetailsIsOpen, setModalDetailsIsOpen] = useState(false);
  const [modalDeleteIsOpen, setModalDeleteIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const openModalDetails = () => setModalDetailsIsOpen(true);
  const openModalDelete = () => setModalDeleteIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const closeModalDetails = () => setModalDetailsIsOpen(false);
  const closeModalDelete = () => setModalDeleteIsOpen(false);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = "#f00";
  }

  const getAccountDetails = (accountId) => {
    // useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${conversation.getAccountId()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(newDetails)
        //   {
        //     uri: conversation.getFirstMember()?.contact?.getUri(),
        //     signal: controller.signal,
        //   },
      })
      .then((res) => {
        console.log("YYY 0", res);
        res.json();
      })
      .then((result) => {
        console.log("YYY 1", result);
      })
      .catch((e) => console.log("YYY 2", e));
    //       return () => controller.abort()
    //   }, [accountId])
  };

  const [userName, setUserName] = useState("User name");
  const [userId, setUserId] = useState("User id");
  const [codeQr, setVodeQr] = useState("QR");
  const [isSwarm, setIsSwarm] = useState(true);

  const uri = conversation.getId()
    ? `conversation/${conversation.getId()}`
    : `addContact/${conversation.getFirstMember().contact.getUri()}`;
  if (conversation instanceof Conversation) {
    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
        <Modal
          isOpen={modalIsOpen}
          //   onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {/* <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2> */}
          {/* <button onClick={closeModal}>close</button> */}
          <Stack
            onClick={() => {
              navigate(`/account/${conversation.getAccountId()}/${uri}`);
              closeModal();
            }}
            {...stackStyles}
          >
            <div
              style={{
                marginTop: "24px",
              }}
            >
              <MessageIcon />
            </div>
            <div>Message</div>
          </Stack>
          <Stack {...stackStyles}>
            <AudioCallIcon />
            <div>
            Démarrer appel audio

            </div>
          </Stack>

          <Stack {...stackStyles}>
            <VideoCallIcon /> Démarrer appel vidéo
          </Stack>

          <Stack {...stackStyles}>
            <CrossIcon /> Fermer la conversation
          </Stack>

          <Stack
            onClick={() => {
              console.log("open details contact for: ");
              closeModal();
              openModalDetails();
              getAccountDetails(conversation.getAccountId());
            }}
            {...stackStyles}
          >
            <ContactDetailsIcon /> Détails de la conversation
          </Stack>

          <Stack
            onClick={() => {
              console.log("open dialog BLOCK: ");
              closeModal();
              openModalDelete();
            }}
            {...stackStyles}
          >
            <BlockContactIcon /> Bloquer le contact
          </Stack>

          <Stack
            onClick={() => {
              console.log("open dialog Supprimer: ");
              closeModal();
              openModalDelete();
            }}
            {...stackStyles}
          >
            <RemoveContactIcon /> Supprimer contact
          </Stack>
        </Modal>

        <Modal
          isOpen={modalDetailsIsOpen}
          //   onAfterOpen={afterOpenModalDetails}
          onRequestClose={closeModalDetails}
          style={customStyles}
          contentLabel="Détails contact"
        >
          <div>
            <Person /> {userName}
          </div>
          <br />

          <div>Nom d'utilisateur {userName}</div>
          <br />

          <div>Identifiant {userId}</div>
          <br />

          <div>Code QR {codeQr}</div>
          <br />

          <div>est un swarm {isSwarm}</div>
          <br />

          <button onClick={closeModalDetails}>Fermer</button>
        </Modal>

        <Modal
          isOpen={modalDeleteIsOpen}
          //   onAfterOpen={afterOpenModalDetails}
          onRequestClose={closeModalDelete}
          style={customStyles}
          contentLabel="Merci de confirmer"
        >
          Voulez vous vraiment supprimer ce contact?
          <button onClick={closeModalDelete}>Bloquer</button>
          <button onClick={closeModalDelete}>Annuler</button>
        </Modal>

        <ListItem
          button
          alignItems="flex-start"
          selected={isSelected}
          // onClick={() =>
          //   navigate(`/account/${conversation.getAccountId()}/${uri}`)
          // }
        >
          <ListItemAvatar>
            <ConversationAvatar
              displayName={conversation.getDisplayNameNoFallback()}
            />
          </ListItemAvatar>
          <ListItemText
            primary={conversation.getDisplayName()}
            secondary={conversation.getDisplayUri()}
          />
        </ListItem>
      </div>
    );
  } else return null;
}
