import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Grade as GradeIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface PerformanceData {
  overview?: {
    totalGrades: number;
    averageGrade: number;
    gradeDistribution: Record<string, number>;
  };
  overallAverage?: number;
  coursePerformance?: Array<{
    courseCode?: string;
    courseName?: string;
    course?: {
      courseCode: string;
      courseName: string;
    };
    average?: number;
    averageGrade?: number;
    trend?: 'up' | 'down' | 'stable';
    assignments?: number;
    totalGrades?: number;
  }>;
  attendance?: {
    present: number;
    total: number;
    percentage: number;
  };
  insights?: Array<{
    type: 'strength' | 'improvement' | 'warning';
    message: string;
  }>;
  performanceTrend?: Array<{
    gradeNumber: number;
    percentage: number;
    courseName: string;
    gradedAt: string;
  }>;
}

const getMockPerformanceData = (): PerformanceData => ({
  overallAverage: 85.5,
  coursePerformance: [
    {
      course: {
        courseCode: 'CS101',
        courseName: 'Introduction to Programming',
      },
      average: 88.2,
      trend: 'up',
      assignments: 8,
    },
    {
      course: { courseCode: 'MATH201', courseName: 'Calculus II' },
      average: 82.1,
      trend: 'stable',
      assignments: 6,
    },
    {
      course: { courseCode: 'ENG101', courseName: 'English Composition' },
      average: 90.5,
      trend: 'up',
      assignments: 5,
    },
  ],
  attendance: {
    present: 45,
    total: 50,
    percentage: 90,
  },
  insights: [
    {
      type: 'strength',
      message:
        'Excellent performance in English Composition with consistent high grades.',
    },
    {
      type: 'improvement',
      message:
        'Consider spending more time on Calculus II to improve understanding.',
    },
    {
      type: 'warning',
      message:
        'Attendance rate is below 95%. Regular attendance is crucial for success.',
    },
  ],
});

export const Performance = () => {
  const location = useLocation();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (location.pathname === '/performance/my-performance') {
        response = await apiService.getStudentPerformance();
      } else if (location.pathname.includes('/performance/course')) {
        response = { data: { data: getMockPerformanceData() } };
      } else if (location.pathname === '/performance/analytics') {
        response = await apiService.getPerformanceInsights();
      } else {
        response = await apiService.getStudentPerformance();
      }

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format');
      }

      setPerformance(response.data.data);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPageTitle = () => {
    if (location.pathname === '/performance/my-performance') {
      return 'My Performance';
    } else if (location.pathname === '/performance/course') {
      return 'Course Performance';
    } else if (location.pathname === '/performance/analytics') {
      return 'Performance Analytics';
    }
    return 'Performance';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return (
          <TrendingUpIcon color="error" sx={{ transform: 'rotate(180deg)' }} />
        );
      default:
        return <AssessmentIcon color="info" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <CheckCircleIcon color="success" />;
      case 'improvement':
        return <AssessmentIcon color="warning" />;
      case 'warning':
        return <WarningIcon color="error" />;
      default:
        return <AssessmentIcon />;
    }
  };

  const getInsightColor = (
    type: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (type) {
      case 'strength':
        return 'success';
      case 'improvement':
        return 'warning';
      case 'warning':
        return 'error';
      default:
        return 'default';
    }
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

  if (!performance) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>
          No performance data available.
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
        <Typography component="div" variant="h6" color="text.secondary">
          {location.pathname === '/performance/my-performance'
            ? 'Track your academic progress and performance'
            : 'Analyze performance metrics and insights'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon
                sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {(
                  performance.overview?.averageGrade ||
                  performance.overallAverage ||
                  0
                ).toFixed(1)}
                %
              </Typography>
              <Typography component="div" variant="h6" color="text.secondary">
                Overall Average
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  performance.overview?.averageGrade ||
                  performance.overallAverage ||
                  0
                }
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon
                sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }}
              />
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {performance.attendance?.percentage ?? 0}%
              </Typography>
              <Typography component="div" variant="h6" color="text.secondary">
                Attendance Rate
              </Typography>
              <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {performance.attendance
                  ? `${performance.attendance.present} of ${performance.attendance.total} classes`
                  : 'No attendance data'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GradeIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {performance.coursePerformance?.length || 0}
              </Typography>
              <Typography component="div" variant="h6" color="text.secondary">
                Active Courses
              </Typography>
              <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enrolled this semester
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Course Performance
              </Typography>
              {performance.coursePerformance?.map((course, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">
                      {course.course?.courseCode || course.courseCode || 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {course.trend ? (
                        getTrendIcon(course.trend)
                      ) : (
                        <AssessmentIcon color="info" />
                      )}
                      <Typography variant="h6" fontWeight="bold">
                        {(course.averageGrade || course.average || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {course.course?.courseName ||
                      course.courseName ||
                      'Unknown Course'}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={course.averageGrade || course.average || 0}
                    sx={{ mb: 1 }}
                  />

                  <Typography component="div" variant="caption" color="text.secondary">
                    {course.totalGrades || course.assignments || 0}{' '}
                    {course.totalGrades ? 'grades' : 'assignments'} completed
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Performance Insights
              </Typography>
              <List>
                {performance.insights?.map((insight, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>{getInsightIcon(insight.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box component="div">
                          <Chip
                            label={
                              insight.type.charAt(0).toUpperCase() +
                              insight.type.slice(1)
                            }
                            color={getInsightColor(insight.type)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography component="div" variant="body2" color="text.secondary">
                          {insight.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
