import { CircularProgress, Container } from '@mui/material';

export default function LoadingPage() {
  return (
    <Container style={{ textAlign: 'center' }}>
      <CircularProgress style={{ margin: 32 }} />
    </Container>
  );
}
