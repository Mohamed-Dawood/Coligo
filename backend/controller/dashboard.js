import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Announcement from '../models/Announcement.js';
import Grade from '../models/Grade.js';
import Schedule from '../models/Schedule.js';

// Get dashboard overview for a student
export const getStudentDashboard = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const currentSemester = req.query.semester || 'Fall 2024';

  // Get student info
  const student = await User.findById(userId).select('-password');
  
  // Get enrolled courses
  const courses = await Course.find({
    students: userId,
    semester: currentSemester,
    isActive: true,
  }).populate('instructor', 'name email');

  // Get upcoming quizzes
  const upcomingQuizzes = await Quiz.find({
    course: { $in: courses.map(course => course._id) },
    startDate: { $gte: new Date() },
    isActive: true,
  })
    .populate('course', 'courseName courseCode')
    .sort({ startDate: 1 })
    .limit(5);

  // Get recent announcements
  const announcements = await Announcement.find({
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      { course: { $in: courses.map(course => course._id) } },
    ],
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ],
  })
    .populate('author', 'name')
    .populate('course', 'courseName courseCode')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get today's schedule
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today.getDay()];

  const todaysSchedule = await Schedule.find({
    student: userId,
    day: todayName,
    semester: currentSemester,
    isActive: true,
  })
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'name')
    .sort({ startTime: 1 });

  // Get recent grades
  const recentGrades = await Grade.find({
    student: userId,
    semester: currentSemester,
  })
    .populate('course', 'courseName courseCode')
    .sort({ gradedAt: -1 })
    .limit(5);

  // Calculate statistics
  const totalCourses = courses.length;
  const totalQuizzes = await Quiz.countDocuments({
    course: { $in: courses.map(course => course._id) },
    isActive: true,
  });
  
  const completedQuizzes = await Quiz.countDocuments({
    course: { $in: courses.map(course => course._id) },
    endDate: { $lt: new Date() },
    isActive: true,
  });

  const averageGrade = await Grade.aggregate([
    {
      $match: {
        student: userId,
        semester: currentSemester,
      },
    },
    {
      $group: {
        _id: null,
        averagePercentage: { $avg: '$percentage' },
      },
    },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: {
      student,
      overview: {
        totalCourses,
        totalQuizzes,
        completedQuizzes,
        averageGrade: averageGrade[0]?.averagePercentage || 0,
      },
      upcomingQuizzes,
      announcements,
      todaysSchedule,
      recentGrades,
    },
  });
});

// Get dashboard overview for a teacher
export const getTeacherDashboard = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const currentSemester = req.query.semester || 'Fall 2024';

  // Get teacher info
  const teacher = await User.findById(userId).select('-password');
  
  // Get courses taught by teacher
  const courses = await Course.find({
    instructor: userId,
    semester: currentSemester,
    isActive: true,
  }).populate('students', 'name studentId email');

  // Get total students
  const totalStudents = courses.reduce((total, course) => total + course.students.length, 0);

  // Get quizzes created by teacher
  const quizzes = await Quiz.find({
    instructor: userId,
    isActive: true,
  })
    .populate('course', 'courseName courseCode')
    .sort({ createdAt: -1 });

  // Get recent announcements
  const announcements = await Announcement.find({
    author: userId,
    isActive: true,
  })
    .populate('course', 'courseName courseCode')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get pending grades to review
  const pendingGrades = await Grade.find({
    gradedBy: userId,
    semester: currentSemester,
  })
    .populate('student', 'name studentId')
    .populate('course', 'courseName courseCode')
    .sort({ gradedAt: -1 })
    .limit(10);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Teacher dashboard data retrieved successfully',
    data: {
      teacher,
      overview: {
        totalCourses: courses.length,
        totalStudents,
        totalQuizzes: quizzes.length,
        pendingGrades: pendingGrades.length,
      },
      courses,
      recentQuizzes: quizzes.slice(0, 5),
      announcements,
      pendingGrades,
    },
  });
});

// Get dashboard overview for admin
export const getAdminDashboard = catchAsync(async (req, res, next) => {
  const currentSemester = req.query.semester || 'Fall 2024';

  // Get total statistics
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
  const totalCourses = await Course.countDocuments({ semester: currentSemester, isActive: true });
  const totalQuizzes = await Quiz.countDocuments({ isActive: true });
  const totalAnnouncements = await Announcement.countDocuments({ isActive: true });

  // Get recent activity
  const recentUsers = await User.find({ isActive: true })
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentCourses = await Course.find({ isActive: true })
    .populate('instructor', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentAnnouncements = await Announcement.find({ isActive: true })
    .populate('author', 'name')
    .populate('course', 'courseName')
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Admin dashboard data retrieved successfully',
    data: {
      overview: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalQuizzes,
        totalAnnouncements,
      },
      recentUsers,
      recentCourses,
      recentAnnouncements,
    },
  });
});
