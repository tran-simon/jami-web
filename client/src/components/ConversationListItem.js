import { ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import React, { useState } from "react";
import Conversation from '../../../model/Conversation'
import { useNavigate, useParams } from "react-router-dom"
import ConversationAvatar from './ConversationAvatar'
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { Person } from "@mui/icons-material";
import authManager from '../AuthManager'

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
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
          <button onClick={closeModal}>close</button>

          <div>
            <Person /> Démarrer appel vidéo
          </div>
          <br />

          <div>
            <Person /> Démarrer appel audio
          </div>
          <br />

          <div
            onClick={() => {
              console.log("open dialog Supprimer: ");
              closeModal();
              openModalDelete();
            }}
          >
            <Person /> Supprimer contact
          </div>
          <br />

          <div
            onClick={() => {
              console.log("open dialog BLOCK: ");
              closeModal();
              openModalDelete();
            }}
          >
            <Person /> Bloquer le contact
          </div>
          <br />

          <div
            onClick={() => {
              console.log("open details contact for: ");
              closeModal();
              openModalDetails();
              getAccountDetails(conversation.getAccountId());
            }}
          >
            <Person /> Détails de la conversation
          </div>
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
          onClick={() =>
            navigate(`/account/${conversation.getAccountId()}/${uri}`)
          }
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
