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
import { Box, Card, CardActions, CardContent, Container, Fab, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import authManager from '../AuthManager';
import UsernameChooser from '../components/UsernameChooser';

export default function JamiAccountDialog() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = await authManager
      .fetch('/api/accounts', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registerName: name }),
      })
      .then((res) => res.json())
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
    console.log(result);
    if (result && result.accountId) navigate(`/account/${result.accountId}/settings`);
  };

  return (
    <Container>
      <Card component="form" onSubmit={onSubmit}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Create Jami account
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Welcome to the Jami web node setup.
            <br />
            Let&apos;s start by creating a new administrator account to control access to the server configuration.
          </Typography>

          <Box>
            <UsernameChooser disabled={loading} setName={setName} />
          </Box>
        </CardContent>
        <CardActions>
          {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
          <Fab color="primary" type="submit" variant="extended" disabled={!name || loading}>
            <AddRounded />
            Register name
          </Fab>
        </CardActions>
      </Card>
    </Container>
  );
}
