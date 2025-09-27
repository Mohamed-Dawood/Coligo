import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError } from '../error/index.js';
import Schedule from '../models/Schedule.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get student's schedule
export const getStudentSchedule = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester, day } = req.query;

  const filter = {
    student: userId,
    isActive: true,
  };

  if (semester) filter.semester = semester;
  if (day) filter.day = day;

  const schedules = await Schedule.find(filter)
    .populate('course', 'courseName courseCode credits')
    .populate('instructor', 'name email')
    .sort({ day: 1, startTime: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Schedule retrieved successfully',
    data: schedules,
    meta: { count: schedules.length },
  });
});

// Get schedule by day
export const getScheduleByDay = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { day } = req.params;
  const { semester } = req.query;

  const filter = {
    student: userId,
    day: day,
    isActive: true,
  };

  if (semester) filter.semester = semester;

  const schedules = await Schedule.find(filter)
    .populate('course', 'courseName courseCode credits')
    .populate('instructor', 'name email')
    .sort({ startTime: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: `${day} schedule retrieved successfully`,
    data: schedules,
    meta: { count: schedules.length },
  });
});

// Get today's schedule
export const getTodaysSchedule = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  const today = new Date();
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayName = dayNames[today.getDay()];

  const filter = {
    student: userId,
    day: todayName,
    isActive: true,
  };

  if (semester) filter.semester = semester;

  const schedules = await Schedule.find(filter)
    .populate('course', 'courseName courseCode credits')
    .populate('instructor', 'name email')
    .sort({ startTime: 1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Today's schedule retrieved successfully",
    data: schedules,
    meta: { count: schedules.length },
  });
});

// Create schedule (admin/teacher only)
export const createSchedule = catchAsync(async (req, res, next) => {
  const { studentId, courseId, day, startTime, endTime, room, instructorId } =
    req.body;

  if (
    !studentId ||
    !courseId ||
    !day ||
    !startTime ||
    !endTime ||
    !room ||
    !instructorId
  ) {
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

  // Verify instructor exists
  const instructor = await User.findById(instructorId);
  if (!instructor || instructor.role !== 'teacher') {
    return next(new BadRequestError('Invalid instructor ID'));
  }

  const schedule = await Schedule.create({
    student: studentId,
    course: courseId,
    day,
    startTime,
    endTime,
    room,
    instructor: instructorId,
    semester: course.semester,
  });

  await schedule.populate([
    { path: 'student', select: 'name studentId email' },
    { path: 'course', select: 'courseName courseCode' },
    { path: 'instructor', select: 'name email' },
  ]);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Schedule created successfully',
    data: schedule,
  });
});

// Update schedule
export const updateSchedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { day, startTime, endTime, room, instructorId } = req.body;

  const schedule = await Schedule.findById(id);
  if (!schedule) {
    return next(new BadRequestError('Schedule not found'));
  }

  if (instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'teacher') {
      return next(new BadRequestError('Invalid instructor ID'));
    }
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    id,
    { day, startTime, endTime, room, instructor: instructorId },
    { new: true, runValidators: true }
  ).populate([
    { path: 'student', select: 'name studentId email' },
    { path: 'course', select: 'courseName courseCode' },
    { path: 'instructor', select: 'name email' },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Schedule updated successfully',
    data: updatedSchedule,
  });
});

// Delete schedule
export const deleteSchedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const schedule = await Schedule.findById(id);
  if (!schedule) {
    return next(new BadRequestError('Schedule not found'));
  }

  await Schedule.findByIdAndUpdate(id, { isActive: false });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Schedule deleted successfully',
  });
});

// Get weekly schedule
export const getWeeklySchedule = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { semester } = req.query;

  const filter = {
    student: userId,
    isActive: true,
  };

  if (semester) filter.semester = semester;

  const schedules = await Schedule.find(filter)
    .populate('course', 'courseName courseCode credits')
    .populate('instructor', 'name email')
    .sort({ day: 1, startTime: 1 });

  // Group by day
  const weeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  schedules.forEach((schedule) => {
    weeklySchedule[schedule.day].push(schedule);
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Weekly schedule retrieved successfully',
    data: weeklySchedule,
  });
});
