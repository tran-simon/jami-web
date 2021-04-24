import React, { useEffect, useState } from 'react';
import Header from '../components/Header'
import NewContactForm from '../components/NewContactForm'

//import Sound from 'react-sound';
import io from "socket.io-client";
import ConversationList from '../components/ConversationList';
//const socket = io.connect('http://localhost:3000');
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation'
import Contact from '../../../model/Contact'
import ConversationView from '../components/ConversationView';
import AddContactPage from './addContactPage.jsx';
import LoadingPage from '../components/loading';
import { useParams } from 'react-router';

const JamiMessenger = (props) => {
  const [conversations, setConversations] = useState(undefined)
  const [searchResult, setSearchResults] = useState(undefined)

  const params = useParams()
  const accountId = props.accountId || params.accountId
  const conversationId = props.conversationId || params.conversationId
  const contactId = props.contactId || params.contactId

      //this.socket = socketIOClient(ENDPOINT);
    /*socket.on('connect', () => {
      console.log("Success !")
    })*/
        //this.socket.on("FromAPI", data => {
    //  this.setState({
    //    messages: [...this.state.messages, data]
    //  })
    //});
    /*socket.on('receivedMessage', (data) => {
      const message = {
        senderId: '65f6674b26e5af6ed0b4e92a13b80ff4bbfdf1e8',
        text: data
      }
      this.setState({
        messages: [...this.state.messages, message],
        sound: true
      })
    });*/
  useEffect(() => {
    console.log("io.connect")
    const socket = io()
    socket.on('receivedMessage', (data) => {
      console.log("receivedMessage")
      console.log(data)
      conversation.addMessage(data)
    })
    return () => socket.disconnect()
  })

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

  const handleSearch = (query) => {
    authManager.fetch(`/api/accounts/${accountId}/ns/name/${query}`)
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
  }

  console.log("JamiMessenger render " + conversationId)
  console.log(props)

  return (
    <div className="app" >
      <Header />
      {conversations ?
        <ConversationList search={searchResult} conversations={conversations} accountId={accountId} /> :
        <div className="rooms-list"><LoadingPage /></div>}
      <NewContactForm onChange={handleSearch} />
      {conversationId && <ConversationView accountId={accountId} conversationId={conversationId} />}
      {contactId && <AddContactPage accountId={accountId} contactId={contactId} />}
    </div>
  )
}

export default JamiMessenger