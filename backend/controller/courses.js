import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError, Unauthenticated } from '../error/index.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Schedule from '../models/Schedule.js';

// Get all courses
export const getAllCourses = catchAsync(async (req, res, next) => {
  const { semester, department, instructor } = req.query;
  const { role, userId } = req.user;

  let filter = { isActive: true };

  if (semester) filter.semester = semester;
  if (department) filter.department = department;
  if (instructor) filter.instructor = instructor;

  // If student, only show enrolled courses
  if (role === 'student') {
    filter.students = userId;
  }

  const courses = await Course.find(filter)
    .populate('instructor', 'name email')
    .populate('students', 'name studentId email')
    .sort({ courseName: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Courses retrieved successfully',
    data: courses,
    meta: { count: courses.length },
  });
});

// Get course by ID
export const getCourseById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  const course = await Course.findById(id)
    .populate('instructor', 'name email phone')
    .populate('students', 'name studentId email phone');

  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  // Check if student is enrolled or if user is instructor/admin
  if (role === 'student' && !course.students.some(student => student._id.toString() === userId)) {
    return next(new Unauthenticated('Not enrolled in this course'));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course retrieved successfully',
    data: course,
  });
});

// Create course (teacher/admin only)
export const createCourse = catchAsync(async (req, res, next) => {
  const { courseCode, courseName, description, credits, department, instructorId } = req.body;

  if (!courseCode || !courseName || !credits || !department || !instructorId) {
    return next(new BadRequestError('Please provide all required fields'));
  }

  // Verify instructor exists
  const instructor = await User.findById(instructorId);
  if (!instructor || instructor.role !== 'teacher') {
    return next(new BadRequestError('Invalid instructor ID'));
  }

  const course = await Course.create({
    courseCode,
    courseName,
    description,
    credits,
    department,
    instructor: instructorId,
  });

  await course.populate('instructor', 'name email');

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

// Update course
export const updateCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { courseName, description, credits, department, instructorId } = req.body;

  const course = await Course.findById(id);
  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  if (instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'teacher') {
      return next(new BadRequestError('Invalid instructor ID'));
    }
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { courseName, description, credits, department, instructor: instructorId },
    { new: true, runValidators: true }
  ).populate('instructor', 'name email');

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course updated successfully',
    data: updatedCourse,
  });
});

// Enroll student in course
export const enrollStudent = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return next(new BadRequestError('Please provide student ID'));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new BadRequestError('Invalid student ID'));
  }

  // Check if already enrolled
  if (course.students.includes(studentId)) {
    return next(new BadRequestError('Student already enrolled in this course'));
  }

  course.students.push(studentId);
  await course.save();

  await course.populate('students', 'name studentId email');

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student enrolled successfully',
    data: course,
  });
});

// Remove student from course
export const removeStudent = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return next(new BadRequestError('Please provide student ID'));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  course.students = course.students.filter(id => id.toString() !== studentId);
  await course.save();

  await course.populate('students', 'name studentId email');

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student removed from course successfully',
    data: course,
  });
});

// Get course schedule
export const getCourseSchedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  const schedules = await Schedule.find({
    course: id,
    isActive: true,
  })
    .populate('student', 'name studentId')
    .populate('instructor', 'name email')
    .sort({ day: 1, startTime: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course schedule retrieved successfully',
    data: schedules,
    meta: { count: schedules.length },
  });
});

// Delete course
export const deleteCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return next(new BadRequestError('Course not found'));
  }

  await Course.findByIdAndUpdate(id, { isActive: false });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

// Get courses by department
export const getCoursesByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.params;
  const { semester } = req.query;

  const filter = {
    department,
    isActive: true,
  };

  if (semester) filter.semester = semester;

  const courses = await Course.find(filter)
    .populate('instructor', 'name email')
    .populate('students', 'name studentId email')
    .sort({ courseName: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Department courses retrieved successfully',
    data: courses,
    meta: { count: courses.length },
  });
});
