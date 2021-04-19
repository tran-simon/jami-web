import React from 'react'
import { InputBase, InputAdornment } from '@material-ui/core';
import { SearchRounded } from '@material-ui/icons';

class NewContactForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: ''}
        this.controller = new AbortController()
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        this.controller = new AbortController()
    }

    componentWillUnmount() {
        this.controller.abort()
        this.req = undefined
    }

    handleChange(event) {
        this.setState({value: event.target.value})
        this.props.onChange(event.target.value)
    }

    handleSubmit(event) {
        event.preventDefault()
        if (this.props.onSubmit)
            this.props.onSubmit(this.state.value)
    }

    render() {
        return (
            <form className="main-search" onSubmit={this.handleSubmit} noValidate autoComplete="off">
                <InputBase
                    className="main-search-input"
                    type="search"
                    placeholder="Ajouter un contact"
                    onChange={this.handleChange}
                    startAdornment={<InputAdornment position="start"><SearchRounded /></InputAdornment>}
                />
            </form>
        )
    }
}

export default NewContactForm