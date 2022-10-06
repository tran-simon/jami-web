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
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Account from '../../../model/Account';
import authManager from '../AuthManager';
import AccountPreferences from '../components/AccountPreferences';
import Header from '../components/Header';

type ServerOverviewProps = {
  accountId?: string;
};

const ServerOverview = (props: ServerOverviewProps) => {
  const [account, setAccount] = useState<Account | null>(null);
  const params = useParams();
  const accountId = props.accountId || params.accountId;

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/serverConfig`, { signal: controller.signal })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setAccount(Account.from(result));
      })
      .catch((e) => console.log(e));
    // return () => controller.abort() // crash on React18
  }, [accountId]);

  return (
    <Container maxWidth="sm" className="app">
      <Header />
      {account != null ? <AccountPreferences account={account} /> : <CircularProgress />}
    </Container>
  );
};

export default ServerOverview;
