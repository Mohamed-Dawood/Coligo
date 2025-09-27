import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError, Unauthenticated } from '../error/index.js';
import Grade from '../models/Grade.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';

// Get student's grades
export const getStudentGrades = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester, courseId, gradeType } = req.query;

  let filter = { student: userId };

  if (semester) filter.semester = semester;
  if (courseId) filter.course = courseId;
  if (gradeType) filter.gradeType = gradeType;

  const grades = await Grade.find(filter)
    .populate('course', 'courseName courseCode')
    .populate('gradedBy', 'name')
    .sort({ gradedAt: -1 });

  // Calculate statistics
  const totalGrades = grades.length;
  const averageGrade = grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades || 0;
  const highestGrade = Math.max(...grades.map(grade => grade.percentage), 0);
  const lowestGrade = Math.min(...grades.map(grade => grade.percentage), 0);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student grades retrieved successfully',
    data: {
      grades,
      statistics: {
        totalGrades,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
      },
    },
    meta: { count: totalGrades },
  });
});

// Get grades by course
export const getGradesByCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { semester, studentId } = req.query;
  const { role, userId } = req.user;

  let filter = { course: courseId };

  if (semester) filter.semester = semester;
  if (studentId) filter.student = studentId;

  // If teacher, only show grades for their courses
  if (role === 'teacher') {
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== userId) {
      return next(new Unauthenticated('Not authorized to view this course grades'));
    }
  }

  const grades = await Grade.find(filter)
    .populate('student', 'name studentId email')
    .populate('course', 'courseName courseCode')
    .populate('gradedBy', 'name')
    .sort({ gradedAt: -1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course grades retrieved successfully',
    data: grades,
    meta: { count: grades.length },
  });
});

// Add grade
export const addGrade = catchAsync(async (req, res, next) => {
  const { studentId, courseId, quizId, gradeType, title, pointsEarned, totalPoints, feedback } = req.body;
  const { userId } = req.user;

  if (!studentId || !courseId || !gradeType || !title || pointsEarned === undefined || !totalPoints) {
    return next(new BadRequestError('Please provide all required fields'));
  }

  // Verify student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new BadRequestError('Invalid student ID'));
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new BadRequestError('Invalid course ID'));
  }

  // Check if student is enrolled in course
  if (!course.students.includes(studentId)) {
    return next(new BadRequestError('Student is not enrolled in this course'));
  }

  // If quiz grade, verify quiz exists
  if (quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new BadRequestError('Invalid quiz ID'));
    }
  }

  const grade = await Grade.create({
    student: studentId,
    course: courseId,
    quiz: quizId,
    gradeType,
    title,
    pointsEarned,
    totalPoints,
    feedback,
    gradedBy: userId,
    semester: course.semester,
  });

  await grade.populate([
    { path: 'student', select: 'name studentId email' },
    { path: 'course', select: 'courseName courseCode' },
    { path: 'gradedBy', select: 'name' },
  ]);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Grade added successfully',
    data: grade,
  });
});

// Update grade
export const updateGrade = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { pointsEarned, totalPoints, feedback } = req.body;

  const grade = await Grade.findById(id);
  if (!grade) {
    return next(new BadRequestError('Grade not found'));
  }

  const updatedGrade = await Grade.findByIdAndUpdate(
    id,
    { pointsEarned, totalPoints, feedback },
    { new: true, runValidators: true }
  ).populate([
    { path: 'student', select: 'name studentId email' },
    { path: 'course', select: 'courseName courseCode' },
    { path: 'gradedBy', select: 'name' },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Grade updated successfully',
    data: updatedGrade,
  });
});

// Delete grade
export const deleteGrade = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const grade = await Grade.findById(id);
  if (!grade) {
    return next(new BadRequestError('Grade not found'));
  }

  await Grade.findByIdAndDelete(id);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Grade deleted successfully',
  });
});

// Get grade statistics
export const getGradeStatistics = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { semester } = req.query;

  let filter = { course: courseId };
  if (semester) filter.semester = semester;

  const grades = await Grade.find(filter);

  if (grades.length === 0) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'No grades found',
      data: {
        statistics: {
          totalGrades: 0,
          averageGrade: 0,
          highestGrade: 0,
          lowestGrade: 0,
          gradeDistribution: {},
        },
      },
    });
  }

  const percentages = grades.map(grade => grade.percentage);
  const averageGrade = percentages.reduce((sum, grade) => sum + grade, 0) / percentages.length;
  const highestGrade = Math.max(...percentages);
  const lowestGrade = Math.min(...percentages);

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
    message: 'Grade statistics retrieved successfully',
    data: {
      statistics: {
        totalGrades: grades.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
        gradeDistribution,
      },
    },
  });
});

// Get student's course grades
export const getStudentCourseGrades = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { courseId } = req.params;
  const { semester } = req.query;

  let filter = { student: userId, course: courseId };
  if (semester) filter.semester = semester;

  const grades = await Grade.find(filter)
    .populate('course', 'courseName courseCode')
    .populate('gradedBy', 'name')
    .sort({ gradedAt: -1 });

  // Calculate course average
  const courseAverage = grades.length > 0 
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length 
    : 0;

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student course grades retrieved successfully',
    data: {
      grades,
      courseAverage: Math.round(courseAverage * 100) / 100,
    },
    meta: { count: grades.length },
  });
});
