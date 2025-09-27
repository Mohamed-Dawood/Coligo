import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              border: '1px solid',
              borderColor: 'error.main',
              borderRadius: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText',
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Something went wrong!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </Typography>
            {this.state.error && (
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                Error: {this.state.error.message}
              </Typography>
            )}
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRefresh}
              color="inherit"
            >
              Refresh Page
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
