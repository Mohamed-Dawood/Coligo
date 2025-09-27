import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError } from '../error/index.js';
import Grade from '../models/Grade.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Schedule from '../models/Schedule.js';

// Get student performance overview
export const getStudentPerformance = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  let filter = { student: userId };
  if (semester) filter.semester = semester;

  // Get all grades for the student
  const grades = await Grade.find(filter)
    .populate('course', 'courseName courseCode credits')
    .sort({ gradedAt: -1 });

  // Calculate overall statistics
  const totalGrades = grades.length;
  const averageGrade = totalGrades > 0 
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades 
    : 0;

  // Grade distribution
  const gradeDistribution = {
    'A+': grades.filter(g => g.letterGrade === 'A+').length,
    'A': grades.filter(g => g.letterGrade === 'A').length,
    'A-': grades.filter(g => g.letterGrade === 'A-').length,
    'B+': grades.filter(g => g.letterGrade === 'B+').length,
    'B': grades.filter(g => g.letterGrade === 'B').length,
    'B-': grades.filter(g => g.letterGrade === 'B-').length,
    'C+': grades.filter(g => g.letterGrade === 'C+').length,
    'C': grades.filter(g => g.letterGrade === 'C').length,
    'C-': grades.filter(g => g.letterGrade === 'C-').length,
    'D+': grades.filter(g => g.letterGrade === 'D+').length,
    'D': grades.filter(g => g.letterGrade === 'D').length,
    'D-': grades.filter(g => g.letterGrade === 'D-').length,
    'F': grades.filter(g => g.letterGrade === 'F').length,
  };

  // Performance by course
  const coursePerformance = await Grade.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$course',
        averageGrade: { $avg: '$percentage' },
        totalGrades: { $sum: 1 },
        latestGrade: { $max: '$gradedAt' },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $project: {
        courseName: '$course.courseName',
        courseCode: '$course.courseCode',
        averageGrade: { $round: ['$averageGrade', 2] },
        totalGrades: 1,
        latestGrade: 1,
      },
    },
    { $sort: { averageGrade: -1 } },
  ]);

  // Recent performance trend (last 10 grades)
  const recentGrades = grades.slice(0, 10).reverse();
  const performanceTrend = recentGrades.map((grade, index) => ({
    gradeNumber: index + 1,
    percentage: grade.percentage,
    courseName: grade.course.courseName,
    gradedAt: grade.gradedAt,
  }));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student performance retrieved successfully',
    data: {
      overview: {
        totalGrades,
        averageGrade: Math.round(averageGrade * 100) / 100,
        gradeDistribution,
      },
      coursePerformance,
      performanceTrend,
    },
  });
});

// Get course performance analytics
export const getCoursePerformance = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { semester } = req.query;

  let filter = { course: courseId };
  if (semester) filter.semester = semester;

  // Get course info
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .populate('students', 'name studentId email');

  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  // Get all grades for the course
  const grades = await Grade.find(filter)
    .populate('student', 'name studentId')
    .sort({ gradedAt: -1 });

  // Calculate course statistics
  const totalGrades = grades.length;
  const averageGrade = totalGrades > 0 
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades 
    : 0;

  const highestGrade = totalGrades > 0 ? Math.max(...grades.map(g => g.percentage)) : 0;
  const lowestGrade = totalGrades > 0 ? Math.min(...grades.map(g => g.percentage)) : 0;

  // Student performance in this course
  const studentPerformance = await Grade.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$student',
        averageGrade: { $avg: '$percentage' },
        totalGrades: { $sum: 1 },
        latestGrade: { $max: '$gradedAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    {
      $unwind: '$student',
    },
    {
      $project: {
        studentName: '$student.name',
        studentId: '$student.studentId',
        averageGrade: { $round: ['$averageGrade', 2] },
        totalGrades: 1,
        latestGrade: 1,
      },
    },
    { $sort: { averageGrade: -1 } },
  ]);

  // Grade distribution
  const gradeDistribution = {
    'A+': grades.filter(g => g.letterGrade === 'A+').length,
    'A': grades.filter(g => g.letterGrade === 'A').length,
    'A-': grades.filter(g => g.letterGrade === 'A-').length,
    'B+': grades.filter(g => g.letterGrade === 'B+').length,
    'B': grades.filter(g => g.letterGrade === 'B').length,
    'B-': grades.filter(g => g.letterGrade === 'B-').length,
    'C+': grades.filter(g => g.letterGrade === 'C+').length,
    'C': grades.filter(g => g.letterGrade === 'C').length,
    'C-': grades.filter(g => g.letterGrade === 'C-').length,
    'D+': grades.filter(g => g.letterGrade === 'D+').length,
    'D': grades.filter(g => g.letterGrade === 'D').length,
    'D-': grades.filter(g => g.letterGrade === 'D-').length,
    'F': grades.filter(g => g.letterGrade === 'F').length,
  };

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course performance retrieved successfully',
    data: {
      course,
      statistics: {
        totalGrades,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
        gradeDistribution,
      },
      studentPerformance,
    },
  });
});

// Get performance comparison
export const getPerformanceComparison = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  let filter = { student: userId };
  if (semester) filter.semester = semester;

  // Get student's grades
  const studentGrades = await Grade.find(filter)
    .populate('course', 'courseName courseCode');

  // Get all grades for comparison
  const allGrades = await Grade.find(semester ? { semester } : {})
    .populate('course', 'courseName courseCode');

  // Calculate student's average
  const studentAverage = studentGrades.length > 0 
    ? studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / studentGrades.length 
    : 0;

  // Calculate overall average
  const overallAverage = allGrades.length > 0 
    ? allGrades.reduce((sum, grade) => sum + grade.percentage, 0) / allGrades.length 
    : 0;

  // Performance by grade type
  const performanceByType = await Grade.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$gradeType',
        averageGrade: { $avg: '$percentage' },
        totalGrades: { $sum: 1 },
      },
    },
    {
      $project: {
        gradeType: '$_id',
        averageGrade: { $round: ['$averageGrade', 2] },
        totalGrades: 1,
      },
    },
    { $sort: { averageGrade: -1 } },
  ]);

  // Monthly performance trend
  const monthlyTrend = await Grade.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: '$gradedAt' },
          month: { $month: '$gradedAt' },
        },
        averageGrade: { $avg: '$percentage' },
        totalGrades: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id.month',
        year: '$_id.year',
        averageGrade: { $round: ['$averageGrade', 2] },
        totalGrades: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Performance comparison retrieved successfully',
    data: {
      comparison: {
        studentAverage: Math.round(studentAverage * 100) / 100,
        overallAverage: Math.round(overallAverage * 100) / 100,
        difference: Math.round((studentAverage - overallAverage) * 100) / 100,
      },
      performanceByType,
      monthlyTrend,
    },
  });
});

// Get attendance performance (if attendance tracking is implemented)
export const getAttendancePerformance = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  // Get student's schedule
  let filter = { student: userId, isActive: true };
  if (semester) filter.semester = semester;

  const schedules = await Schedule.find(filter)
    .populate('course', 'courseName courseCode');

  // This would need to be implemented with an Attendance model
  // For now, return basic schedule information
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Attendance performance retrieved successfully',
    data: {
      schedules,
      note: 'Attendance tracking not yet implemented',
    },
    meta: { count: schedules.length },
  });
});

// Get performance insights and recommendations
export const getPerformanceInsights = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  let filter = { student: userId };
  if (semester) filter.semester = semester;

  const grades = await Grade.find(filter)
    .populate('course', 'courseName courseCode')
    .sort({ gradedAt: -1 });

  const insights = [];
  const recommendations = [];

  // Analyze performance trends
  if (grades.length >= 5) {
    const recentGrades = grades.slice(0, 5);
    const olderGrades = grades.slice(5, 10);

    if (recentGrades.length > 0 && olderGrades.length > 0) {
      const recentAverage = recentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / recentGrades.length;
      const olderAverage = olderGrades.reduce((sum, grade) => sum + grade.percentage, 0) / olderGrades.length;

      if (recentAverage > olderAverage + 5) {
        insights.push('Your performance has improved recently!');
        recommendations.push('Keep up the good work and maintain your study routine.');
      } else if (recentAverage < olderAverage - 5) {
        insights.push('Your recent performance has declined.');
        recommendations.push('Consider reviewing your study methods and seeking help from instructors.');
      }
    }
  }

  // Analyze grade distribution
  const failingGrades = grades.filter(g => g.letterGrade === 'F').length;
  if (failingGrades > 0) {
    insights.push(`You have ${failingGrades} failing grade(s).`);
    recommendations.push('Focus on understanding the material and consider getting extra help.');
  }

  const excellentGrades = grades.filter(g => ['A+', 'A', 'A-'].includes(g.letterGrade)).length;
  if (excellentGrades > grades.length * 0.7) {
    insights.push('You have excellent grades in most subjects!');
    recommendations.push('Consider taking on additional challenges or helping classmates.');
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Performance insights retrieved successfully',
    data: {
      insights,
      recommendations,
      totalGrades: grades.length,
    },
  });
});
