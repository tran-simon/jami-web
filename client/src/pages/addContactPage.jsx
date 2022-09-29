import { useNavigate } from 'react-router-dom';

import { Box, Container, Fab, Card, CardContent, Typography } from '@mui/material';
import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import authManager from '../AuthManager';
import { useAppDispatch } from '../../redux/hooks';
import { setRefreshFromSlice } from '../../redux/appSlice';

export default function AddContactPage(props) {
  const navigate = useNavigate();
  const accountId = props.accountId || props.match.params.accountId;
  const contactId = props.contactId || props.match.params.contactId;
  const dispatch = useAppDispatch();

  const handleClick = async (e) => {
    const response = await authManager
      .fetch(`/api/accounts/${accountId}/conversations`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: [contactId] }),
      })
      .then((res) => {
        dispatch(setRefreshFromSlice());
        return res.json();
      });

    console.log(response);
    if (response.conversationId) {
      navigate(`/account/${accountId}/conversation/${response.conversationId}`);
    }
  };

  return (
    <Container className="messenger">
      <Card variant="outlined" style={{ borderRadius: 16, maxWidth: 560, margin: '16px auto' }}>
        <CardContent>
          <Typography variant="h6">Jami key ID</Typography>
          <Typography variant="body1">{contactId}</Typography>
          <Box style={{ textAlign: 'center', marginTop: 16 }}>
            <Fab variant="extended" color="primary" onClick={handleClick}>
              <GroupAddRounded />
              Add contact
            </Fab>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
