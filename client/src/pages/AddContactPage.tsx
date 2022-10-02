import GroupAddRounded from '@mui/icons-material/GroupAddRounded';
import { Box, Card, CardContent, Container, Fab, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import { setRefreshFromSlice } from '../../redux/appSlice';
import { useAppDispatch } from '../../redux/hooks';
import authManager from '../AuthManager';

type AddContactPageProps = {
  accountId: string;
  contactId: string;
};

export default function AddContactPage(props: AddContactPageProps) {
  const navigate = useNavigate();

  const params = useParams();
  const accountId = props.accountId || params.accountId;
  const contactId = props.contactId || params.contactId;
  const dispatch = useAppDispatch();

  const handleClick = async () => {
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
