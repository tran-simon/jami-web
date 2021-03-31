import React from 'react';
import Header from '../components/Header'
import ContactList from '../components/ContactList'
import MessageList from '../components/MessageList'
import SendMessageForm from '../components/SendMessageForm'
import NewContactForm from '../components/NewContactForm'
import Sound from 'react-sound';
import io from "socket.io-client";
var socket = io.connect('http://localhost:3000');

class Jaas extends React.Component {

  constructor() {
    super()
    this.state = {
      messages: [],
      sound: false
    }

    socket.on('connect', () => {
      console.log("Success !")
    })

    //import io from 'socket.io-client';

    //this.socket = socketIOClient(ENDPOINT);
    //this.socket.on("FromAPI", data => {
    //  this.setState({
    //    messages: [...this.state.messages, data]
    //  })
    //});
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount() {
    socket.on('receivedMessage', (data) => {
      var message = {
        senderId: '65f6674b26e5af6ed0b4e92a13b80ff4bbfdf1e8',
        text: data
      }
      this.setState({
        messages: [...this.state.messages, message],
        sound: true
      })
    });
  }

  sendMessage(text) {
    var data = {
      senderId: 'Me',
      destinationId: '65f6674b26e5af6ed0b4e92a13b80ff4bbfdf1e8',
      text: text
    }
    socket.emit("SendMessage", data);
    console.log(data.text);
    this.setState({
      messages: [...this.state.messages, data],
      sound: false
    })
  }
  render() {
    return (
      <div className="app" >
        <Header />
        <ContactList />
        <MessageList messages={this.state.messages} />
        <SendMessageForm sendMessage={this.sendMessage} />
        <NewContactForm />
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

export default Jaas;