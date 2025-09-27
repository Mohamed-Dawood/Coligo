import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Announcement as AnnouncementIcon,
  PriorityHigh as PriorityHighIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  courseId?: string;
  course?: {
    courseCode: string;
    courseName: string;
  };
  targetAudience: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
  authorInfo?: {
    name: string;
  };
  expiresAt?: string;
  attachments?: Array<{
    filename: string;
    fileUrl: string;
    fileSize: number;
  }>;
  createdAt: string;
  isRead?: boolean;
}

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    courseId: '',
    targetAudience: 'all',
    priority: 'medium' as 'low' | 'medium' | 'high',
    expiresAt: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [location.pathname]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getAnnouncements({
        targetAudience: user?.role === 'student' ? 'students' : 'all'
      });

      setAnnouncements(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await apiService.createAnnouncement({
        ...newAnnouncement,
        author: user?.id || '',
      });
      setCreateDialogOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        courseId: '',
        targetAudience: 'all',
        priority: 'medium',
        expiresAt: '',
      });
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      setError('Failed to create announcement');
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await apiService.markAnnouncementAsRead(announcementId);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/announcements/create') {
      return 'Create Announcement';
    }
    return 'Announcements';
  };

  const canCreateAnnouncement = () => {
    return (user?.role === 'teacher' || user?.role === 'admin') && 
           location.pathname === '/announcements/create';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? <PriorityHighIcon /> : <AnnouncementIcon />;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {getPageTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {location.pathname === '/announcements/create' 
            ? 'Create announcements for your students'
            : 'Stay updated with important announcements'
          }
        </Typography>
      </Box>

      {announcements.length === 0 ? (
        <Box textAlign="center" py={8}>
          <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No announcements found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {location.pathname === '/announcements/create' 
              ? 'Create your first announcement to get started.'
              : 'No announcements have been posted yet.'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Card
                sx={{
                  opacity: isExpired(announcement.expiresAt) ? 0.7 : 1,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      {announcement.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={getPriorityIcon(announcement.priority)}
                        label={announcement.priority.toUpperCase()}
                        color={getPriorityColor(announcement.priority) as any}
                        size="small"
                      />
                      {isExpired(announcement.expiresAt) && (
                        <Chip label="EXPIRED" color="error" size="small" />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {announcement.content}
                  </Typography>
                  
                  {announcement.course && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`${announcement.course.courseCode} - ${announcement.course.courseName}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {announcement.authorInfo?.name || 'Unknown Author'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {announcement.expiresAt && (
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      {announcement.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          size="small"
                          startIcon={<AnnouncementIcon />}
                          href={attachment.fileUrl}
                          target="_blank"
                          sx={{ mr: 1, mb: 1 }}
                        >
                          {attachment.filename}
                        </Button>
                      ))}
                    </Box>
                  )}
                  
                  {user?.role === 'student' && !announcement.isRead && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarkAsRead(announcement._id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
            />
            
            <TextField
              label="Course ID (optional)"
              value={newAnnouncement.courseId}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, courseId: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={newAnnouncement.targetAudience}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value })}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="students">Students Only</MenuItem>
                <MenuItem value="teachers">Teachers Only</MenuItem>
                <MenuItem value="admins">Admins Only</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Expires At (optional)"
              type="datetime-local"
              value={newAnnouncement.expiresAt}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Create Announcement */}
      {canCreateAnnouncement() && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

