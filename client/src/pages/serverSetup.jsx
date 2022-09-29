import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import { Box, Card, CardContent, Container, Fab, Input, Typography } from '@mui/material';
import { useState } from 'react';

import authManager from '../AuthManager';

export default function ServerSetup(props) {
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => password && password === passwordRepeat;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!isValid()) return;
    authManager.setup(password);
  };

  return (
    <Container className="message-list">
      <Card disabled={loading}>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Typography gutterBottom variant="h5" component="h2">
            Jami Web Node setup
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Welcome to the Jami web node setup.
            <br />
            Let's start by creating a new administrator account to control access to the server configuration.
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
              />
            </div>
          </Box>
          <Box style={{ textAlign: 'center', marginTop: 24 }}>
            <Fab variant="extended" color="primary" type="submit" disabled={!isValid()}>
              <GroupAddRounded />
              Create admin account
            </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
