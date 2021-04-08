import React from 'react'
import TextField from '@material-ui/core/TextField'
//import InputEmoji from "react-input-emoji";

class SendMessageForm extends React.Component {

    constructor() {
        super()
        this.state = {
            message: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(e) {
        this.setState({
            message: e
        })
    }

    handleSubmit(e) {
        //e.preventDefault()
        this.props.sendMessage(this.state.message)
        //this.props.sendMessage(this.state.message)
        this.setState({
            message: ''
        })
    }

    render() {
        return (
            <div
                //onSubmit={this.handleSubmit}
                className="send-message-form">
                <TextField
                    disabled={this.props.disabled}
                    onChange={this.handleChange}
                    value={this.state.message}
                    //cleanOnEnter
                    //onEnter={this.handleSubmit}
                    placeholder="Écris ton message et cliques sur Entrer"
                    height="35"
                />

            </div>
        )
    }
}

export default SendMessageForm