import { useState, useEffect, useCallback, memo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface ScheduleItem {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  courseId: string;
  course?: {
    courseCode: string;
    courseName: string;
  };
  instructorId: string;
  instructor?: {
    name: string;
  };
  studentId?: string;
  semester: string;
}

export const Schedule = memo(() => {
  const { user } = useAuth();
  const location = useLocation();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<{
    [key: string]: ScheduleItem[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day: '',
    startTime: '',
    endTime: '',
    room: '',
    courseId: '',
    instructorId: user?.id || '',
  });

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (location.pathname === '/schedule/today') {
        response = await apiService.getTodaySchedule();
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error("Invalid response format for today's schedule");
        }
        setSchedule(response.data.data);
      } else if (location.pathname === '/schedule/weekly') {
        response = await apiService.getWeeklySchedule();
        if (!response.data || !response.data.data) {
          throw new Error('Invalid response format for weekly schedule');
        }
        const weekly = response.data.data as { [key: string]: ScheduleItem[] };
        // Update the weekly schedule state
        setWeeklySchedule(weekly);
        // Also update the flat schedule array for other features
        setSchedule(Object.values(weekly).flat());
      } else {
        response = await apiService.getSchedule();
        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid response format for schedule');
        }
        setSchedule(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load schedule'
      );
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleCreateSchedule = async () => {
    try {
      await apiService.createSchedule(newSchedule);
      setCreateDialogOpen(false);
      setNewSchedule({
        day: '',
        startTime: '',
        endTime: '',
        room: '',
        courseId: '',
        instructorId: user?.id || '',
      });
      await fetchSchedule();
    } catch (error) {
      console.error('Failed to create schedule:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create schedule'
      );
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/schedule/today') {
      return "Today's Schedule";
    } else if (location.pathname === '/schedule/weekly') {
      return 'Weekly Schedule';
    } else if (location.pathname === '/schedule/create') {
      return 'Create Schedule';
    }
    return 'Schedule';
  };

  const canCreateSchedule = () => {
    return (
      (user?.role === 'teacher' || user?.role === 'admin') &&
      location.pathname === '/schedule/create'
    );
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return schedule.filter((item) => item.day === today);
  };

  const getWeeklySchedule = () => {
    if (location.pathname === '/schedule/weekly') {
      // If we're in weekly view, use the pre-formatted weekly schedule
      return weeklySchedule;
    } else {
      // For other views, group the schedule data by day
      const grouped: { [key: string]: ScheduleItem[] } = {};
      days.forEach((day) => {
        grouped[day] = schedule.filter(
          (item: ScheduleItem) => item.day === day
        );
      });
      return grouped;
    }
  };

  const renderTodaySchedule = () => {
    const todaySchedule = getTodaySchedule();

    if (todaySchedule.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No classes today
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have no scheduled classes for today.
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {todaySchedule.map((item) => (
          <Grid item xs={12} md={6} key={item._id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {item.course?.courseCode || 'Course'}
                  </Typography>
                  <Chip label={item.day} color="primary" />
                </Box>

                <Typography variant="h5" gutterBottom>
                  {item.course?.courseName || 'Course Name'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {item.startTime} - {item.endTime}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoomIcon fontSize="small" color="action" />
                    <Typography variant="body2">Room: {item.room}</Typography>
                  </Box>

                  {item.instructor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Instructor: {item.instructor.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderWeeklySchedule = () => {
    const weeklySchedule = getWeeklySchedule();

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Instructor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => {
              const daySchedule = weeklySchedule[day] || [];
              if (daySchedule.length === 0) {
                return (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No classes
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return daySchedule.map((item, index) => (
                <TableRow key={`${day}-${index}`}>
                  <TableCell>{index === 0 ? day : ''}</TableCell>
                  <TableCell>
                    {item.startTime} - {item.endTime}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {item.course?.courseCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.course?.courseName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.room}</TableCell>
                  <TableCell>{item.instructor?.name || 'TBA'}</TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
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
          {location.pathname === '/schedule/today'
            ? 'Your classes for today'
            : location.pathname === '/schedule/weekly'
            ? 'Your weekly class schedule'
            : 'Manage your schedule'}
        </Typography>
      </Box>

      {location.pathname === '/schedule/today' && renderTodaySchedule()}
      {location.pathname === '/schedule/weekly' && renderWeeklySchedule()}

      {location.pathname === '/schedule' && (
        <Grid container spacing={3}>
          {schedule.map((item) => (
            <Grid item xs={12} md={6} key={item._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {item.course?.courseCode || 'Course'}
                    </Typography>
                    <Chip label={item.day} color="primary" />
                  </Box>

                  <Typography variant="h5" gutterBottom>
                    {item.course?.courseName || 'Course Name'}
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {item.startTime} - {item.endTime}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RoomIcon fontSize="small" color="action" />
                      <Typography variant="body2">Room: {item.room}</Typography>
                    </Box>

                    {item.instructor && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Instructor: {item.instructor.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Schedule Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Day"
              value={newSchedule.day}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, day: e.target.value })
              }
              fullWidth
            >
              {days.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Start Time"
              type="time"
              value={newSchedule.startTime}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, startTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Time"
              type="time"
              value={newSchedule.endTime}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, endTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Room"
              value={newSchedule.room}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, room: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Course ID"
              value={newSchedule.courseId}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, courseId: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSchedule} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Create Schedule */}
      {canCreateSchedule() && (
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
});
