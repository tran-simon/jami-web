import { Fragment, useEffect, useState } from 'react'
import { Avatar, Card, CardHeader, Container, List } from '@mui/material';
import Header from '../components/Header'
import authManager from '../AuthManager'
import Account from '../../../model/Account';
import LoadingPage from '../components/loading';
import ListItemLink from '../components/ListItemLink';
import ConversationAvatar from '../components/ConversationAvatar';
import { AddRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const variants = {
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "-50px" },
}

const AccountSelection = (props) => {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    authManager.fetch(`/api/accounts`, {signal: controller.signal})
      .then(res => res.json())
      .then(result => {
        console.log(result)
        if (result.length === 0) {
          navigate('/newAccount')
        } else {
          setLoaded(true)
          setAccounts(result.map(account => Account.from(account)))
        }
      }, error => {
        console.log(`get error ${error}`)
        setLoaded(true)
        setError(true)
      }).catch(e => console.log(e))
   // return () => controller.abort() // crash on React18
  }, [])

  if (!loaded)
    return <LoadingPage />
  return (
    <Fragment>
      <Header />
      <Container maxWidth="sm" style={{paddingBottom:32}}>
        <motion.div drag="x" initial="exit" animate="enter" exit="exit" variants={variants}>
        <Card style={{marginTop:32, marginBottom:32}}>
          <CardHeader title="Choose an account" />
          <List>
            {accounts.map(account => <ListItemLink key={account.getId()}
              icon={<ConversationAvatar displayName={account.getDisplayNameNoFallback()} />}
              to={`/account/${account.getId()}/settings`}
              primary={account.getDisplayName()}
              secondary={account.getDisplayUri()} />)}
            <ListItemLink
              icon={<Avatar><AddRounded /></Avatar>}
              to='/newAccount'
              primary="Create new account" />
          </List>
        </Card>
        </motion.div>
      </Container>
    </Fragment>
  );
}

export default AccountSelection