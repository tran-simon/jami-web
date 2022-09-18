import { useEffect, useState } from 'react'
import Header from '../components/Header'
import NewContactForm from '../components/NewContactForm'

//import Sound from 'react-sound';
import ConversationList from '../components/ConversationList';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation'
import Contact from '../../../model/Contact'
import ConversationView from '../components/ConversationView';
import AddContactPage from './addContactPage.jsx';
import LoadingPage from '../components/loading';
import { useParams } from 'react-router';
import { Stack } from '@mui/material';
import { useAppSelector } from '../../redux/hooks';


const Messenger = (props) => {
  const { refresh } = useAppSelector((state) => state.app);

  const [conversations, setConversations] = useState(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResults] = useState(undefined)

  const params = useParams()
  const accountId = props.accountId || params.accountId
  const conversationId = props.conversationId || params.conversationId
  const contactId = props.contactId || params.contactId

  useEffect(() => {
    console.log("REFRESH CONVERSATIONS FROM MESSENGER")
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}/conversations`, {signal: controller.signal})
    .then(res => res.json())
    .then(result => {
      console.log(result)
      setConversations(Object.values(result).map(c => Conversation.from(accountId, c)))
    })
    // return () => controller.abort()
  }, [accountId, refresh])

  useEffect(() => {
    if (!searchQuery)
      return
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}/ns/name/${searchQuery}`, {signal: controller.signal})
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error(response.status)
      }
    }).then(response => {
      console.log(response)
      const contact = new Contact(response.address)
      contact.setRegisteredName(response.name)
      setSearchResults(contact ? Conversation.fromSingleContact(accountId, contact) : undefined)
    }).catch(e => {
      setSearchResults(undefined)
    })
   // return () => controller.abort() // crash on React18
  }, [accountId, searchQuery])

  console.log("Messenger render")
  return (
    <Stack
      direction="row"
      height="100vh"
      width="100vw"
    >
      <Stack
        flexGrow={0}
        flexShrink={0}
        overflow="auto"
      >
        <Header />
        <NewContactForm onChange={setSearchQuery} />
        {contactId && <AddContactPage accountId={accountId} contactId={contactId} />}
        {conversations ?
          <ConversationList search={searchResult} conversations={conversations} accountId={accountId} /> :
          <div className="rooms-list"><LoadingPage /></div>
        }
      </Stack>
      <Stack
        flexGrow={1}
      >
        {conversationId && <ConversationView accountId={accountId} conversationId={conversationId} />}
      </Stack>
    </Stack>
  )
}

export default Messenger