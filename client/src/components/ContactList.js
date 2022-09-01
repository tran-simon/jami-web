import List from "@mui/material/List";
import authManager from "../AuthManager";
import ConversationAvatar from "./ConversationAvatar";
import Modal from 'react-modal';
import React, { useState, useEffect } from "react";
import { Person } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { ListItem, ListItemAvatar, ListItemText } from "@mui/material";

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

export default function ContactList() {
  const { accountId, accountObject } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState({});

  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalDetailsIsOpen, setModalDetailsIsOpen] = useState(false);
  const [modalDeleteIsOpen, setModalDeleteIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const openModalDetails = () => setModalDetailsIsOpen(true);
  const openModalDelete = () => setModalDeleteIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const closeModalDetails = () => setModalDetailsIsOpen(false);
  const closeModalDelete = () => setModalDeleteIsOpen(false);

  const getContactDetails = () => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/contacts/${currentContact.id}`, {
        signal: controller.signal,
      })
      .then((res) => res.json())
      .then((result) => {
        // setContacts(result);
        console.log("CONTACT LIST - DETAILS: ", result);
      })
      .catch((e) => console.log("ERROR 2", e));
  };

  const removeContact = () => {};

  const blockContact = () => {};


  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/conversations`, {
        signal: controller.signal,
      })
      .then((res) => res.json())
      .then((result) => {
        setContacts(result);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="rooms-list">
      <Modal
        isOpen={modalIsOpen}
        //   onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {/* <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2> */}
        <button onClick={closeModal}>close</button>

        {/* <div>
            <Person /> Démarrer appel vidéo
          </div>
          <br />

          <div>
            <Person /> Démarrer appel audio
          </div> */}
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
            getContactDetails();
          }}
        >
          <Person /> Détails du contact
        </div>
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

      <List>
        {contacts.map((contact) => (
          <ListItem
            button
            alignItems="flex-start"
            // selected={isSelected}
            onClick={() => {
              setCurrentContact(contact);
              openModal();
            }}
          >
            <ListItemAvatar>
              <ConversationAvatar
              // displayName={conversation.getDisplayNameNoFallback()}
              // displayName={`${contact.id}`}
              />
            </ListItemAvatar>
            <ListItemText primary={contact.id} secondary={contact.id} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
