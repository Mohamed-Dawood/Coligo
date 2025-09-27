import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Quiz as QuizIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  author: Author;
  course?: {
    _id: string;
    courseName: string;
    courseCode: string;
  };
  isActive: boolean;
}

interface Schedule {
  _id: string;
  course: {
    _id: string;
    courseName: string;
    courseCode: string;
  };
  instructor: {
    _id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  room: string;
  day: string;
  semester: string;
  isActive: boolean;
}

interface DashboardStats {
  totalStudents?: number;
  totalCourses?: number;
  averageGrade?: number;
  completionRate?: number;
  upcomingQuizzes?: number;
  pendingAssignments?: number;
  upcomingClasses?: number;
  unreadAnnouncements?: number;
  activeQuizzes?: number;
  pendingGrades?: number;
  totalTeachers?: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [upcomingClasses, setUpcomingClasses] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        let dashboardResponse;
        if (user?.role === 'student') {
          dashboardResponse = await apiService.getStudentDashboard();
        } else if (user?.role === 'teacher') {
          dashboardResponse = await apiService.getTeacherDashboard();
        } else {
          dashboardResponse = await apiService.getAdminDashboard();
        }

        const responseData = dashboardResponse.data.data;

        // Map stats based on user role
        if (user?.role === 'student') {
          const { overview } = responseData;
          setStats({
            totalCourses: overview.totalCourses || 0,
            upcomingClasses: responseData.todaysSchedule?.length || 0,
            averageGrade: Math.round(overview.averageGrade) || 0,
            unreadAnnouncements: responseData.announcements?.length || 0,
            completionRate:
              Math.round(
                (overview.completedQuizzes / overview.totalQuizzes) * 100
              ) || 0,
          });
          setRecentAnnouncements(responseData.announcements || []);
          setUpcomingClasses(responseData.todaysSchedule || []);
        } else if (user?.role === 'teacher') {
          const { overview } = responseData;
          setStats({
            totalCourses: overview.totalCourses || 0,
            totalStudents: overview.totalStudents || 0,
            activeQuizzes: overview.totalQuizzes || 0,
            pendingGrades: overview.pendingGrades || 0,
          });
          setRecentAnnouncements(responseData.announcements || []);
          setUpcomingClasses([]); // Teachers don't have personal schedules
        } else {
          // Admin
          const { overview } = responseData;
          setStats({
            totalStudents: overview.totalStudents || 0,
            totalTeachers: overview.totalTeachers || 0,
            totalCourses: overview.totalCourses || 0,
          });
          setRecentAnnouncements(responseData.recentAnnouncements || []);
          setUpcomingClasses([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

  const getRoleSpecificCards = () => {
    if (user?.role === 'student') {
      return [
        {
          title: 'My Courses',
          value: stats.totalCourses || 0,
          icon: <SchoolIcon />,
          color: 'primary',
        },
        {
          title: "Today's Classes",
          value: stats.upcomingClasses || 0,
          icon: <ScheduleIcon />,
          color: 'secondary',
        },
        {
          title: 'Average Grade',
          value: `${stats.averageGrade || 0}%`,
          icon: <GradeIcon />,
          color: 'success',
        },
        {
          title: 'Unread Announcements',
          value: stats.unreadAnnouncements || 0,
          icon: <AnnouncementIcon />,
          color: 'warning',
        },
      ];
    } else if (user?.role === 'teacher') {
      return [
        {
          title: 'My Courses',
          value: stats.totalCourses || 0,
          icon: <SchoolIcon />,
          color: 'primary',
        },
        {
          title: 'Total Students',
          value: stats.totalStudents || 0,
          icon: <PeopleIcon />,
          color: 'secondary',
        },
        {
          title: 'Active Quizzes',
          value: stats.activeQuizzes || 0,
          icon: <QuizIcon />,
          color: 'success',
        },
        {
          title: 'Pending Grades',
          value: stats.pendingGrades || 0,
          icon: <AssignmentIcon />,
          color: 'warning',
        },
      ];
    } else {
      return [
        {
          title: 'Total Students',
          value: stats.totalStudents || 0,
          icon: <PeopleIcon />,
          color: 'primary',
        },
        {
          title: 'Total Teachers',
          value: stats.totalTeachers || 0,
          icon: <PeopleIcon />,
          color: 'secondary',
        },
        {
          title: 'Active Courses',
          value: stats.totalCourses || 0,
          icon: <SchoolIcon />,
          color: 'success',
        },
        {
          title: 'System Status',
          value: 'Online',
          icon: <TrendingUpIcon />,
          color: 'info',
        },
      ];
    }
  };

  const getWelcomeMessage = () => {
    const role = user?.role?.toUpperCase();
    return `Welcome to your ${role} Dashboard`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's an overview of your academic information
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getRoleSpecificCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${card.color}.light`,
                      color: `${card.color}.contrastText`,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  fontWeight="bold"
                  gutterBottom
                >
                  {card.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Announcements
            </Typography>
            {recentAnnouncements.length > 0 ? (
              <List>
                {recentAnnouncements.map((announcement) => (
                  <ListItem
                    key={announcement._id}
                    divider
                    alignItems="flex-start"
                  >
                    <ListItemIcon>
                      <AnnouncementIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {announcement.title}
                          </Typography>
                          <Chip
                            label={announcement.priority}
                            size="small"
                            color={
                              announcement.priority === 'high'
                                ? 'error'
                                : announcement.priority === 'medium'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="div"
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {announcement.content?.substring(0, 100)}
                            {announcement.content?.length > 100 ? '...' : ''}
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {announcement.course
                                ? `${announcement.course.courseCode} - ${announcement.course.courseName}`
                                : 'General Announcement'}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              Posted by {announcement.author.name} •{' '}
                              {new Date(
                                announcement.createdAt
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No recent announcements
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Today's Schedule
            </Typography>
            {upcomingClasses.length > 0 ? (
              <List>
                {upcomingClasses.map((schedule) => (
                  <ListItem key={schedule._id} divider alignItems="flex-start">
                    <ListItemIcon>
                      <ScheduleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {schedule.course.courseCode} -{' '}
                            {schedule.course.courseName}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            Room {schedule.room}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="div"
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {new Date(schedule.startTime).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                            {' - '}
                            {new Date(schedule.endTime).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            Instructor: {schedule.instructor.name}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No classes scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
