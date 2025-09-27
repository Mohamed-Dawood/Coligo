import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const TestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Test Page
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          This is a test page to verify routing is working.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Go to Home
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};
