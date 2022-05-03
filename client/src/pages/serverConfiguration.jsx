import React from 'react'
import Header from '../components/Header'
import AccountPreferences from '../components/AccountPreferences'
import Container from '@mui/material/Container'
import CircularProgress from '@mui/material/CircularProgress'
import authManager from '../AuthManager'
import Account from '../../../model/Account'

const ServerOverview = (props) => {

  this.accountId = props.accountId || props.match.params.accountId
  this.state = { loaded: false, account: props.account }
  this.req = undefined

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/serverConfig`, {signal: controller.signal})
      .then(res => res.json())
      .then(result => {
        console.log(result)
        setState({loaded: true, account: Account.from(result)})
      }).catch(e => console.log(e))
      return () => controller.abort()
  }, [accountId])

  /*componentDidMount() {
    this.controller = new AbortController()
    if (this.req === undefined) {
      this.req = authManager.fetch(`/api/serverConfig`, {signal: this.controller.signal})
        .then(res => res.json())
        .then(result => {
          console.log(result)
          this.setState({loaded: true, account: Account.from(result)})
        })
    }
  }

  componentWillUnmount() {
    this.controller.abort()
    this.req = undefined
  }*/

  return (
    <Container maxWidth="sm" className="app" >
      <Header />
      {this.state.loaded ? <AccountPreferences account={this.state.account} /> : <CircularProgress />}
    </Container>
  )
}

export default ServerOverview