import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import { Grade as GradeIcon } from '@mui/icons-material';

import { apiService } from '../services/apiService';
import { useLocation } from 'react-router-dom';

interface Grade {
  _id: string;
  studentId: string;
  courseId: string;
  course?: {
    courseCode: string;
    courseName: string;
  };
  quizId?: string;
  gradeType: string;
  title: string;
  pointsEarned: number;
  totalPoints: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  date: string;
}

interface CourseGrades {
  course: {
    courseCode: string;
    courseName: string;
  };
  grades: Grade[];
  average: number;
  letterGrade: string;
}

export const Gradebook: React.FC = () => {
  const location = useLocation();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getStudentGrades();

      if (
        !response.data?.data?.grades ||
        !Array.isArray(response.data.data.grades)
      ) {
        throw new Error('Invalid response format');
      }

      const gradesData: Grade[] = response.data.data.grades;
      setGrades(gradesData);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load grades'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const getPageTitle = () => {
    if (location.pathname === '/gradebook/my-grades') {
      return 'My Grades';
    } else if (location.pathname === '/gradebook/manage') {
      return 'Manage Grades';
    }
    return 'Gradebook';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const calculateCourseAverages = () => {
    const courseMap = new Map<string, Grade[]>();

    grades.forEach((grade) => {
      const courseKey = grade.course?.courseCode || 'Unknown';
      if (!courseMap.has(courseKey)) {
        courseMap.set(courseKey, []);
      }
      courseMap.get(courseKey)!.push(grade);
    });

    const courseAverages: CourseGrades[] = [];

    courseMap.forEach((courseGrades, courseKey) => {
      const average =
        courseGrades.reduce((sum, grade) => sum + grade.percentage, 0) /
        courseGrades.length;
      const letterGrade = getLetterGrade(average);

      courseAverages.push({
        course: courseGrades[0].course || {
          courseCode: courseKey,
          courseName: 'Unknown Course',
        },
        grades: courseGrades,
        average,
        letterGrade,
      });
    });

    return courseAverages;
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
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

  const courseAverages = calculateCourseAverages();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {getPageTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {location.pathname === '/gradebook/my-grades'
            ? 'Track your academic performance'
            : 'Manage student grades and performance'}
        </Typography>
      </Box>

      {grades.length === 0 ? (
        <Box textAlign="center" py={8}>
          <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No grades found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {location.pathname === '/gradebook/my-grades'
              ? "You don't have any grades yet."
              : 'No grades have been recorded yet.'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Course Averages Summary */}
          {location.pathname === '/gradebook/my-grades' &&
            courseAverages.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Course Overview
                </Typography>
                <Grid container spacing={3}>
                  {courseAverages.map((courseGrade, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {courseGrade.course.courseCode}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {courseGrade.course.courseName}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Typography variant="h4" fontWeight="bold">
                              {courseGrade.average.toFixed(1)}%
                            </Typography>
                            <Chip
                              label={courseGrade.letterGrade}
                              color={getGradeColor(courseGrade.average)}
                              size="small"
                            />
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={courseGrade.average}
                            sx={{ mb: 1 }}
                          />

                          <Typography variant="caption" color="text.secondary">
                            {courseGrade.grades.length} assignments
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

          {/* Detailed Grades Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {grade.course?.courseCode || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {grade.course?.courseName || 'Unknown Course'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{grade.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={grade.gradeType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {grade.pointsEarned} / {grade.totalPoints}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {grade.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={grade.letterGrade}
                          color={getGradeColor(grade.percentage)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(grade.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
};
