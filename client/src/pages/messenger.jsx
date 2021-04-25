import React, { useEffect, useState } from 'react';
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

const JamiMessenger = (props) => {
  const [conversations, setConversations] = useState(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResults] = useState(undefined)

  const params = useParams()
  const accountId = props.accountId || params.accountId
  const conversationId = props.conversationId || params.conversationId
  const contactId = props.contactId || params.contactId

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts/${accountId}/conversations`, {signal: controller.signal})
    .then(res => res.json())
    .then(result => {
      console.log(result)
      setConversations(Object.values(result).map(c => Conversation.from(accountId, c)))
    })
    return () => controller.abort()
  }, [accountId])

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
    return () => controller.abort()
  }, [accountId, searchQuery])

  return (
    <div className="app" >
      <Header />
      <NewContactForm onChange={setSearchQuery} />
      {conversations ?
        <ConversationList search={searchResult} conversations={conversations} accountId={accountId} /> :
        <div className="rooms-list"><LoadingPage /></div>}
      {conversationId && <ConversationView accountId={accountId} conversationId={conversationId} />}
      {contactId && <AddContactPage accountId={accountId} contactId={contactId} />}
    </div>
  )
}

export default JamiMessenger