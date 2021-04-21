import { CircularProgress, Container } from '@material-ui/core';
import React from 'react';

export default function LoadingPage() {
    return <Container style={{ textAlign: "center" }}>
        <CircularProgress style={{ margin: 32 }} />
    </Container>
}