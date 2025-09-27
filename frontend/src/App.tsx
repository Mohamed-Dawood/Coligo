import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Schedule } from './pages/Schedule';
import { Gradebook } from './pages/Gradebook';
import { Performance } from './pages/Performance';
import { Quizzes } from './pages/Quizzes';
import { Announcements } from './pages/Announcements';
import { TestPage } from './pages/TestPage';

// Create a Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/test" element={<TestPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Course routes */}
                <Route
                  path="/courses"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Courses />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/courses/my-courses"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Courses />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/courses/create"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Courses />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Schedule routes */}
                <Route
                  path="/schedule"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Schedule />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/schedule/today"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Schedule />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/schedule/weekly"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Schedule />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/schedule/create"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Schedule />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Gradebook routes */}
                <Route
                  path="/gradebook"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Gradebook />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/gradebook/my-grades"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Gradebook />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/gradebook/manage"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Gradebook />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Performance routes */}
                <Route
                  path="/performance"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Performance />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/performance/my-performance"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Performance />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/performance/course"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Performance />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/performance/analytics"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Performance />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Quiz routes */}
                <Route
                  path="/quizzes"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Quizzes />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/quizzes/available"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Quizzes />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/quizzes/create"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Quizzes />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/quizzes/results"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Quizzes />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                
                {/* Announcement routes */}
                <Route
                  path="/announcements"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Announcements />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/announcements/create"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Announcements />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                </Routes>
              </Box>
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;