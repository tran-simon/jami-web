import { AddRounded } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, Container, Fab, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import authManager from '../AuthManager';
import UsernameChooser from '../components/UsernameChooser';

export default function JamiAccountDialog(props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (event) => {
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
