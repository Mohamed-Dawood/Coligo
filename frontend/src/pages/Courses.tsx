import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  department: string;
  instructorId: string;
  instructor?: {
    name: string;
  };
  enrolledStudents?: string[];
  semester: string;
}

export const Courses: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 3,
    department: '',
    instructorId: user?.id || '',
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (location.pathname === '/courses/my-courses') {
        // Fetch user's enrolled courses
        response = await apiService.getCourses({ instructor: user?.id });
      } else {
        // Fetch all courses
        response = await apiService.getCourses();
      }

      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [location.pathname, user?.id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = async () => {
    try {
      await apiService.createCourse(newCourse);
      setCreateDialogOpen(false);
      setNewCourse({
        courseCode: '',
        courseName: '',
        description: '',
        credits: 3,
        department: '',
        instructorId: user?.id || '',
      });
      fetchCourses();
    } catch (error: unknown) {
      console.error('Failed to create course:', error);
      setError('Failed to create course');
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Validate user authentication
      if (!user?.id) {
        setError('Please log in to enroll in courses');
        return;
      }

      // Validate user role
      if (user.role !== 'student') {
        setError('Only students can enroll in courses');
        return;
      }

      // Check if student is already enrolled
      const course = courses.find((c) => c._id === courseId);
      if (course?.enrolledStudents?.includes(user.id)) {
        setError('You are already enrolled in this course');
        return;
      }

      const response = await apiService.enrollStudent(courseId, user.id);

      if (response.data.success) {
        setSuccessMessage('Successfully enrolled in course!');
        await fetchCourses(); // Refresh the course list
      } else {
        // Handle specific error messages from the backend
        const errorMessage = response.data.msg || response.data.message;
        if (errorMessage === 'Student already enrolled in this course') {
          setError('You are already enrolled in this course');
        } else {
          setError(errorMessage || 'Failed to enroll in course');
        }
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
      // Handle different types of errors
      const axiosError = err as {
        response?: { status: number; data: { msg: string } };
      };
      if (axiosError.response?.status === 400) {
        setError(
          axiosError.response.data.msg || 'Cannot enroll in this course'
        );
      } else if (axiosError.response?.status === 403) {
        setError('You do not have permission to enroll in this course');
      } else if (axiosError.response?.status === 404) {
        setError('Course not found');
      } else {
        setError(
          'An error occurred while enrolling in the course. Please try again later.'
        );
      }
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/courses/my-courses') {
      return 'My Courses';
    } else if (location.pathname === '/courses/create') {
      return 'Create Course';
    }
    return 'All Courses';
  };

  const canCreateCourse = () => {
    return (
      (user?.role === 'teacher' || user?.role === 'admin') &&
      location.pathname !== '/courses/my-courses'
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

  return (
    <Container maxWidth="lg">
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2, mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mt: 2, mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {getPageTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {location.pathname === '/courses/my-courses'
            ? 'Courses you are enrolled in'
            : 'Browse and manage courses'}
        </Typography>
      </Box>

      {courses.length === 0 ? (
        <Box textAlign="center" py={8}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {location.pathname === '/courses/my-courses'
              ? 'You are not enrolled in any courses yet.'
              : 'No courses are available at the moment.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {course.courseCode}
                    </Typography>
                    <Chip
                      label={`${course.credits} Credits`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <Typography variant="h5" component="h3" gutterBottom>
                    {course.courseName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {course.description}
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}
                  >
                    <Chip
                      label={course.department}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={course.semester}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.enrolledStudents?.length || 0} students
                      </Typography>
                    </Box>
                  </Box>

                  {course.instructor && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Instructor: {course.instructor.name}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" startIcon={<ScheduleIcon />}>
                    Schedule
                  </Button>
                  <Button size="small" startIcon={<GradeIcon />}>
                    Grades
                  </Button>
                  {user?.role === 'student' &&
                    location.pathname !== '/courses/my-courses' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEnroll(course._id)}
                      >
                        Enroll
                      </Button>
                    )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Course Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Course Code"
              value={newCourse.courseCode}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseCode: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Course Name"
              value={newCourse.courseName}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Credits"
              type="number"
              value={newCourse.credits}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  credits: parseInt(e.target.value),
                })
              }
              fullWidth
            />
            <TextField
              label="Department"
              value={newCourse.department}
              onChange={(e) =>
                setNewCourse({ ...newCourse, department: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCourse} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Create Course */}
      {canCreateCourse() && (
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
