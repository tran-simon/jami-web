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
import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import { Box, Card, CardContent, Container, Fab, Input, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';

export default function ServerSetup() {
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => password && password === passwordRepeat;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!isValid()) return;
    // TODO: Migrate to new server
    // authManager.setup(password);
  };

  return (
    <Container className="message-list">
      <Card>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Typography gutterBottom variant="h5" component="h2">
            Jami Web Node setup
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Welcome to the Jami web node setup.
            <br />
            Let&apos;s start by creating a new administrator account to control access to the server configuration.
          </Typography>

          <Box style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
            <div>
              <Input value="admin" name="username" autoComplete="username" disabled />
            </div>
            <div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                name="password"
                error={!!passwordRepeat && !isValid()}
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </Box>
          <Box style={{ textAlign: 'center', marginTop: 24 }}>
            <Fab variant="extended" color="primary" type="submit" disabled={!isValid() || loading}>
              <GroupAddRounded />
              Create admin account
            </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
