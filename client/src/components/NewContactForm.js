import React from 'react'
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';

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
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                        } />
            </form>
        )
    }
}

export default NewContactForm