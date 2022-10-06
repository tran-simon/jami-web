/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { AddRounded } from '@mui/icons-material';
import { Avatar, Card, CardHeader, Container, List } from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import ConversationAvatar from '../components/ConversationAvatar';
import Header from '../components/Header';
import ListItemLink from '../components/ListItemLink';
import LoadingPage from '../components/Loading';

const variants = {
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '-50px' },
};

const AccountSelection = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts`, { signal: controller.signal })
      .then((res) => res.json())
      .then(
        (result: Account[]) => {
          console.log(result);
          if (result.length === 0) {
            navigate('/newAccount');
          } else {
            setLoaded(true);
            setAccounts(result.map((account) => Account.from(account)));
          }
        },
        (error) => {
          console.log(`get error ${error}`);
          setLoaded(true);
          setError(true);
        }
      )
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [navigate]);

  if (!loaded) return <LoadingPage />;
  return (
    <Fragment>
      <Header />
      <Container maxWidth="sm" style={{ paddingBottom: 32 }}>
        <motion.div drag="x" initial="exit" animate="enter" exit="exit" variants={variants}>
          <Card style={{ marginTop: 32, marginBottom: 32 }}>
            <CardHeader title="Choose an account" />
            <List>
              {accounts.map((account) => (
                <ListItemLink
                  key={account.getId()}
                  icon={<ConversationAvatar displayName={account.getDisplayNameNoFallback()} />}
                  to={`/account/${account.getId()}/settings`}
                  primary={account.getDisplayName()}
                  secondary={account.getDisplayUri()}
                />
              ))}
              <ListItemLink
                icon={
                  <Avatar>
                    <AddRounded />
                  </Avatar>
                }
                to="/newAccount"
                primary="Create new account"
              />
            </List>
          </Card>
        </motion.div>
      </Container>
    </Fragment>
  );
};

export default AccountSelection;
