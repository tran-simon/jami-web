import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import Contact from '../../../model/Contact';
import Conversation from '../../../model/Conversation';
import { useAppSelector } from '../../redux/hooks';
import authManager from '../AuthManager';
//import Sound from 'react-sound';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView';
import Header from '../components/Header';
import LoadingPage from '../components/Loading';
import NewContactForm from '../components/NewContactForm';
import AddContactPage from './AddContactPage';

type MessengerProps = {
  accountId?: string;
  conversationId?: string;
  contactId?: string;
};

const Messenger = (props: MessengerProps) => {
  const { refresh } = useAppSelector((state) => state.app);

  const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResults] = useState<Conversation | undefined>(undefined);

  const params = useParams();
  const accountId = props.accountId || params.accountId;
  const conversationId = props.conversationId || params.conversationId;
  const contactId = props.contactId || params.contactId;

  if (accountId == null) {
    throw new Error('Missing accountId');
  }

  useEffect(() => {
    console.log('REFRESH CONVERSATIONS FROM MESSENGER');
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/conversations`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result: Conversation[]) => {
        console.log(result);
        setConversations(Object.values(result).map((c) => Conversation.from(accountId, c)));
      });
    // return () => controller.abort()
  }, [accountId, refresh]);

  useEffect(() => {
    if (!searchQuery) return;
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/ns/name/${searchQuery}`, { signal: controller.signal })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error(response.status.toString());
        }
      })
      .then((response) => {
        console.log(response);
        const contact = new Contact(response.address);
        contact.setRegisteredName(response.name);
        setSearchResults(contact ? Conversation.fromSingleContact(accountId, contact) : undefined);
      })
      .catch((e) => {
        setSearchResults(undefined);
      });
    // return () => controller.abort() // crash on React18
  }, [accountId, searchQuery]);

  console.log('Messenger render');
  return (
    <Stack direction="row" height="100vh" width="100vw">
      <Stack flexGrow={0} flexShrink={0} overflow="auto">
        <Header />
        <NewContactForm onChange={setSearchQuery} />
        {contactId && <AddContactPage accountId={accountId} contactId={contactId} />}
        {conversations ? (
          <ConversationList search={searchResult} conversations={conversations} accountId={accountId} />
        ) : (
          <div className="rooms-list">
            <LoadingPage />
          </div>
        )}
      </Stack>
      <Stack flexGrow={1}>
        {conversationId && <ConversationView accountId={accountId} conversationId={conversationId} />}
      </Stack>
    </Stack>
  );
};

export default Messenger;
