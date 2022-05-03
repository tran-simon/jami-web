import { CircularProgress, Container } from '@mui/material';
import React from 'react';

export default function LoadingPage() {
    return <Container style={{ textAlign: "center" }}>
        <CircularProgress style={{ margin: 32 }} />
    </Container>
}