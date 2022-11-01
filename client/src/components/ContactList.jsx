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
import { Person } from '@mui/icons-material';
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import List from '@mui/material/List';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

import authManager from '../AuthManager';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import ConversationAvatar from './ConversationAvatar';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default function ContactList() {
  const { accountId, account } = useAppSelector((state) => state.userInfo);
  const dispatch = useAppDispatch();

  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState({});

  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalDetailsIsOpen, setModalDetailsIsOpen] = useState(false);
  const [modalDeleteIsOpen, setModalDeleteIsOpen] = useState(false);
  const [blockOrRemove, setBlockOrRemove] = useState(true);

  const openModal = () => setIsOpen(true);
  const openModalDetails = () => setModalDetailsIsOpen(true);
  const openModalDelete = () => setModalDeleteIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const closeModalDetails = () => setModalDetailsIsOpen(false);
  const closeModalDelete = () => setModalDeleteIsOpen(false);

  const getContactDetails = () => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/contacts/details/${currentContact.id}`, {
        signal: controller.signal,
      })
      .then((res) => res.json())
      .then((result) => {
        console.log('CONTACT LIST - DETAILS: ', result);
      })
      .catch((e) => console.log('ERROR GET CONTACT DETAILS: ', e));
  };

  const removeOrBlock = (typeOfRemove) => {
    console.log('REMOVE');
    setBlockOrRemove(false);
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/contacts/${typeOfRemove}/${currentContact.id}`, {
        signal: controller.signal,
        method: 'DELETE',
      })
      .then((res) => res.json())
      .catch((e) => console.log(`ERROR ${typeOfRemove}ing CONTACT : `, e));
    closeModalDelete();
  };

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/contacts`, {
        signal: controller.signal,
      })
      .then((res) => res.json())
      .then((result) => {
        console.log('CONTACTS: ', result);
        setContacts(result);
      });
    return () => controller.abort();
  }, [accountId, blockOrRemove]);

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
            console.log('open dialog Supprimer: ');
            setBlockOrRemove(false);
            closeModal();
            openModalDelete();
          }}
        >
          <Person /> Supprimer contact
        </div>
        <br />

        <div
          onClick={() => {
            console.log('open dialog BLOCK: ');
            setBlockOrRemove(true);
            closeModal();
            openModalDelete();
          }}
        >
          <Person /> Bloquer le contact
        </div>
        <br />

        <div
          onClick={() => {
            console.log('open details contact for: ');
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
        Voulez vous vraiment {blockOrRemove ? 'bloquer' : 'supprimer'} ce contact?
        <br />
        {blockOrRemove ? (
          <button onClick={() => removeOrBlock('block')}>Bloquer</button>
        ) : (
          <button onClick={() => removeOrBlock('remove')}>Supprimer</button>
        )}
        <button onClick={closeModalDelete}>Annuler</button>
      </Modal>

      <List>
        {contacts?.map((contact) => (
          <ListItem
            button
            alignItems="flex-start"
            key={contact.id}
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
