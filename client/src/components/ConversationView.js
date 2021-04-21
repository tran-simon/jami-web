import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import authManager from '../AuthManager'
import Conversation from '../../../model/Conversation';
import LoadingPage from './loading';

class ConversationView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loaded:false,
            error: false,
            messages:[]
        }
    }

    componentDidMount() {
      this.controller = new AbortController()
      if (!this.state.loaded) {
        authManager.fetch(`/api/accounts/${this.props.accountId}/conversations/${this.props.conversationId}`, {signal: this.controller.signal})
          .then(res => res.json())
          .then(result => {
            console.log(result)
            this.setState({
              loaded: true,
              conversation: Conversation.from(this.props.accountId, result)// result.map(account => Account.from(account)),
            })
          }, error => {
            console.log(`get error ${error}`)
            this.setState({
              loaded: true,
              error: true
            })
          })
        }
    }
    componentDidUpdate(prevProps, prevState) {
      console.log("componentDidUpdate " + this.props.conversationId)
      if (this.props.conversationId !== prevProps.conversationId) {
        if (this.state.loaded === true) {
          this.setState({
              loaded:false,
              error: false,
              messages:[]
          })
        }
        this.controller = new AbortController()
        authManager.fetch(`/api/accounts/${this.props.accountId}/conversations/${this.props.conversationId}`, {signal: this.controller.signal})
          .then(res => res.json())
          .then(result => {
            console.log(result)
            this.setState({
              loaded: true,
              conversation: Conversation.from(this.props.accountId, result)// result.map(account => Account.from(account)),
            })
          }, error => {
            console.log(`get error ${error}`)
            this.setState({
              loaded: true,
              error: true
            })
          })
      }
    }
    componentWillUnmount() {
      this.controller.abort()
    }

    render() {
        if (this.state.loaded === false) {
            return <LoadingPage />
        } else if (this.state.error === true) {
            return <div>Error loding {this.props.conversationId}</div>
        } else {
        return <React.Fragment>
            <MessageList conversation={this.state.conversation} messages={this.state.messages} />
            <SendMessageForm sendMessage={this.sendMessage} />
          </React.Fragment>
        }
    }
}

export default ConversationView