import { Box, Card, CardContent, Typography } from '@mui/material';

import Account from '../../../model/Account';

type JamiIdCardProps = {
  account: Account;
};

export default function JamiIdCard(props: JamiIdCardProps) {
  const account = props.account;
  const registeredName = account.getRegisteredName();
  return (
    <Card style={{ marginBottom: 16 }}>
      <CardContent>
        <Box>
          <Typography color="textSecondary">Jami ID</Typography>
          <Typography variant="h5" component="h2" gutterBottom noWrap>
            {account.getUri()}
          </Typography>
        </Box>
        {registeredName && (
          <Box>
            <Typography color="textSecondary">Jami username</Typography>
            <Typography variant="h5" component="h2" noWrap>
              {registeredName}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
