import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError, Unauthenticated } from '../error/index.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Grade from '../models/Grade.js';

// Get all quizzes
export const getAllQuizzes = catchAsync(async (req, res, next) => {
  const { courseId, instructor, isActive, semester } = req.query;
  const { role, userId } = req.user;

  let filter = {};

  if (courseId) filter.course = courseId;
  if (instructor) filter.instructor = instructor;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (semester) {
    const courses = await Course.find({ semester }).select('_id');
    filter.course = { $in: courses.map(course => course._id) };
  }

  // If student, only show quizzes for enrolled courses
  if (role === 'student') {
    const studentCourses = await Course.find({
      students: userId,
      isActive: true,
    }).select('_id');

    filter.course = { $in: studentCourses.map(course => course._id) };
  }

  const quizzes = await Quiz.find(filter)
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quizzes retrieved successfully',
    data: quizzes,
    meta: { count: quizzes.length },
  });
});

// Get quiz by ID
export const getQuizById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  const quiz = await Quiz.findById(id)
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'name email');

  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  // If student, check if they're enrolled in the course
  if (role === 'student') {
    const course = await Course.findById(quiz.course);
    if (!course || !course.students.includes(userId)) {
      return next(new Unauthenticated('Not enrolled in this course'));
    }
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz retrieved successfully',
    data: quiz,
  });
});

// Create quiz
export const createQuiz = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    courseId,
    questions,
    timeLimit,
    startDate,
    endDate,
  } = req.body;
  const { userId } = req.user;

  if (!title || !courseId || !questions || !startDate || !endDate) {
    return next(new BadRequestError('Please provide all required fields'));
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new BadRequestError('Invalid course ID'));
  }

  // Check if user is instructor of the course or admin
  if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
    return next(new Unauthenticated('Not authorized to create quiz for this course'));
  }

  const quiz = await Quiz.create({
    title,
    description,
    course: courseId,
    instructor: userId,
    questions,
    timeLimit: timeLimit || 60,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  await quiz.populate([
    { path: 'course', select: 'courseName courseCode' },
    { path: 'instructor', select: 'name email' },
  ]);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Quiz created successfully',
    data: quiz,
  });
});

// Update quiz
export const updateQuiz = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, questions, timeLimit, startDate, endDate } = req.body;

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  // Check if user is instructor of the course or admin
  const course = await Course.findById(quiz.course);
  if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(new Unauthenticated('Not authorized to update this quiz'));
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(
    id,
    {
      title,
      description,
      questions,
      timeLimit,
      startDate: startDate ? new Date(startDate) : quiz.startDate,
      endDate: endDate ? new Date(endDate) : quiz.endDate,
    },
    { new: true, runValidators: true }
  ).populate([
    { path: 'course', select: 'courseName courseCode' },
    { path: 'instructor', select: 'name email' },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz updated successfully',
    data: updatedQuiz,
  });
});

// Delete quiz
export const deleteQuiz = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  // Check if user is instructor of the course or admin
  const course = await Course.findById(quiz.course);
  if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
    return next(new Unauthenticated('Not authorized to delete this quiz'));
  }

  await Quiz.findByIdAndUpdate(id, { isActive: false });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz deleted successfully',
  });
});

// Submit quiz attempt
export const submitQuizAttempt = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { answers, timeSpent } = req.body;
  const { userId } = req.user;

  if (!answers || !Array.isArray(answers)) {
    return next(new BadRequestError('Please provide answers array'));
  }

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  // Check if quiz is still active
  const now = new Date();
  if (now < quiz.startDate || now > quiz.endDate) {
    return next(new BadRequestError('Quiz is not currently active'));
  }

  // Check if student is enrolled in the course
  const course = await Course.findById(quiz.course);
  if (!course || !course.students.includes(userId)) {
    return next(new Unauthenticated('Not enrolled in this course'));
  }

  // Check if student has already attempted the quiz
  const existingAttempt = quiz.attempts.find(
    attempt => attempt.student.toString() === userId
  );

  if (existingAttempt) {
    return next(new BadRequestError('Quiz already attempted'));
  }

  // Calculate score
  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      score += question.points;
    }
  });

  // Add attempt to quiz
  quiz.attempts.push({
    student: userId,
    answers,
    score,
    submittedAt: new Date(),
    timeSpent: timeSpent || 0,
  });

  await quiz.save();

  // Create grade record
  const grade = await Grade.create({
    student: userId,
    course: quiz.course,
    quiz: quiz._id,
    gradeType: 'quiz',
    title: quiz.title,
    pointsEarned: score,
    totalPoints: quiz.totalPoints,
    gradedBy: quiz.instructor,
    semester: course.semester,
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: {
      score,
      totalPoints: quiz.totalPoints,
      percentage: Math.round((score / quiz.totalPoints) * 100),
      grade,
    },
  });
});

// Get quiz results
export const getQuizResults = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const quiz = await Quiz.findById(id)
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'name email');

  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  // If student, only show their own results
  if (req.user.role === 'student') {
    const studentAttempt = quiz.attempts.find(
      attempt => attempt.student.toString() === userId
    );

    if (!studentAttempt) {
      return next(new BadRequestError('No attempt found for this quiz'));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Quiz results retrieved successfully',
      data: {
        quiz: {
          title: quiz.title,
          description: quiz.description,
          totalPoints: quiz.totalPoints,
        },
        attempt: studentAttempt,
      },
    });
  }

  // If instructor/admin, show all results
  const results = await Quiz.findById(id)
    .populate('attempts.student', 'name studentId email')
    .select('title description totalPoints attempts');

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz results retrieved successfully',
    data: results,
  });
});

// Get upcoming quizzes
export const getUpcomingQuizzes = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { days = 7 } = req.query;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));

  // Get student's courses
  const studentCourses = await Course.find({
    students: userId,
    isActive: true,
  }).select('_id');

  const quizzes = await Quiz.find({
    course: { $in: studentCourses.map(course => course._id) },
    startDate: { $gte: new Date(), $lte: futureDate },
    isActive: true,
  })
    .populate('course', 'courseName courseCode')
    .populate('instructor', 'name email')
    .sort({ startDate: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Upcoming quizzes retrieved successfully',
    data: quizzes,
    meta: { count: quizzes.length },
  });
});

// Get quiz statistics
export const getQuizStatistics = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id)
    .populate('course', 'courseName courseCode')
    .populate('attempts.student', 'name studentId');

  if (!quiz) {
    return next(new BadRequestError('Quiz not found'));
  }

  const totalAttempts = quiz.attempts.length;
  const averageScore = totalAttempts > 0 
    ? quiz.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
    : 0;

  const highestScore = totalAttempts > 0 
    ? Math.max(...quiz.attempts.map(attempt => attempt.score)) 
    : 0;

  const lowestScore = totalAttempts > 0 
    ? Math.min(...quiz.attempts.map(attempt => attempt.score)) 
    : 0;

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Quiz statistics retrieved successfully',
    data: {
      quiz: {
        title: quiz.title,
        totalPoints: quiz.totalPoints,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
      },
      attempts: quiz.attempts,
    },
  });
});
