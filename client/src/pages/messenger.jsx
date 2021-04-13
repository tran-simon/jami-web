import React from 'react';
import Header from '../components/Header'
import ContactList from '../components/ContactList'
import MessageList from '../components/MessageList'
import SendMessageForm from '../components/SendMessageForm'
import NewContactForm from '../components/NewContactForm'

//import Sound from 'react-sound';
import io from "socket.io-client";
import ConversationList from '../components/ConversationList';
import CircularProgress from '@material-ui/core/CircularProgress';
//const socket = io.connect('http://localhost:3000');
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation'
import Contact from '../../../model/Contact'
import ConversationView from '../components/ConversationView';
import AddContactPage from './addContactPage.jsx';

class JamiMessenger extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      conversations: undefined,
      messages: [],
      sound: false
    }

    /*socket.on('connect', () => {
      console.log("Success !")
    })*/


    //this.socket = socketIOClient(ENDPOINT);
    //this.socket.on("FromAPI", data => {
    //  this.setState({
    //    messages: [...this.state.messages, data]
    //  })
    //});
    this.sendMessage = this.sendMessage.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.controller = new AbortController()
  }

  componentDidMount() {
    const accountId = this.props.accountId || this.props.match.params.accountId
    const conversationId = this.props.conversationId || this.props.match.params.conversationId

    if (this.req === undefined) {
      this.req = authManager.fetch(`/api/accounts/${accountId}/conversations`, {signal: this.controller.signal})
        .then(res => res.json())
        .then(result => {
          console.log(result)
          this.setState({conversations:  Object.values(result).map(c => Conversation.from(accountId, c))})
        })
    }
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
  }

  componentWillUnmount(){
    this.controller.abort()
    this.req = undefined
  }

  handleSearch(query) {
    const accountId = this.props.accountId || this.props.match.params.accountId
    const conversationId = this.props.conversationId || this.props.match.params.conversationId

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
      this.setState({searchResult: contact ? Conversation.fromSingleContact(accountId, contact) : undefined})
    }).catch(e => {
      this.setState({searchResult: e})
    })
  }

  sendMessage(text) {
    var data = {
      senderId: 'Me',
      destinationId: '65f6674b26e5af6ed0b4e92a13b80ff4bbfdf1e8',
      text: text
    }
    //socket.emit("SendMessage", data);
    console.log(data.text);
    this.setState({
      messages: [...this.state.messages, data],
      sound: false
    })
  }
  render() {
    const accountId = this.props.accountId || this.props.match.params.accountId
    const conversationId = this.props.conversationId || this.props.match.params.conversationId
    const contactId = this.props.contactId || this.props.match.params.contactId

    console.log("JamiMessenger render " + conversationId)
    console.log(this.props)
    console.log(this.state)

    return (
      <div className="app" >
        <Header />
        {this.state.conversations ?
          <ConversationList search={this.state.searchResult} conversations={this.state.conversations} accountId={accountId} /> :
          <CircularProgress />}
        <NewContactForm onChange={query => this.handleSearch(query)} />
        {conversationId && <ConversationView accountId={accountId} conversationId={conversationId} />}
        {contactId && <AddContactPage accountId={accountId} contactId={contactId} />}
        {this.state.sound && <Sound
          url="stairs.mp3" /*https://notificationsounds.com/message-tones/stairs-567*/
          playStatus={Sound.status.PLAYING}
          playFromPosition={0 /* in milliseconds */}
          onLoading={this.handleSongLoading}
          onPlaying={this.handleSongPlaying}
          onFinishedPlaying={this.handleSongFinishedPlaying}
        />}
      </div>
    )
  }
}

export default JamiMessenger;