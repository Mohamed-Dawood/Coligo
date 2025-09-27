import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/catchAsync.js';
import { BadRequestError } from '../error/index.js';
import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all announcements
export const getAllAnnouncements = catchAsync(async (req, res, next) => {
  const { targetAudience, courseId, priority, author } = req.query;
  const { role, userId } = req.user;

  let filter = { isActive: true };

  // Filter by target audience
  if (targetAudience) filter.targetAudience = targetAudience;
  if (priority) filter.priority = priority;
  if (author) filter.author = author;
  if (courseId) filter.course = courseId;

  // If student, show relevant announcements
  if (role === 'student') {
    // Get student's enrolled courses
    const studentCourses = await Course.find({
      students: userId,
      isActive: true,
    }).select('_id');

    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      { course: { $in: studentCourses.map(course => course._id) } },
    ];
  }

  // Filter out expired announcements
  filter.$and = [
    {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    },
  ];

  const announcements = await Announcement.find(filter)
    .populate('author', 'name email')
    .populate('course', 'courseName courseCode')
    .sort({ priority: -1, createdAt: -1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcements retrieved successfully',
    data: announcements,
    meta: { count: announcements.length },
  });
});

// Get announcement by ID
export const getAnnouncementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  const announcement = await Announcement.findById(id)
    .populate('author', 'name email')
    .populate('course', 'courseName courseCode');

  if (!announcement) {
    return next(new BadRequestError('Announcement not found'));
  }

  // Mark as read for the current user
  const isAlreadyRead = announcement.readBy.some(
    read => read.user.toString() === userId
  );

  if (!isAlreadyRead) {
    announcement.readBy.push({
      user: userId,
      readAt: new Date(),
    });
    await announcement.save();
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcement retrieved successfully',
    data: announcement,
  });
});

// Create announcement
export const createAnnouncement = catchAsync(async (req, res, next) => {
  const {
    title,
    content,
    courseId,
    targetAudience,
    priority,
    expiresAt,
    attachments,
  } = req.body;
  const { userId } = req.user;

  if (!title || !content) {
    return next(new BadRequestError('Please provide title and content'));
  }

  // If course-specific announcement, verify course exists
  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new BadRequestError('Invalid course ID'));
    }
  }

  const announcement = await Announcement.create({
    title,
    content,
    author: userId,
    course: courseId,
    targetAudience: targetAudience || 'all',
    priority: priority || 'medium',
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    attachments: attachments || [],
  });

  await announcement.populate([
    { path: 'author', select: 'name email' },
    { path: 'course', select: 'courseName courseCode' },
  ]);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Announcement created successfully',
    data: announcement,
  });
});

// Update announcement
export const updateAnnouncement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, priority, expiresAt, attachments } = req.body;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return next(new BadRequestError('Announcement not found'));
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    id,
    {
      title,
      content,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : announcement.expiresAt,
      attachments,
    },
    { new: true, runValidators: true }
  ).populate([
    { path: 'author', select: 'name email' },
    { path: 'course', select: 'courseName courseCode' },
  ]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcement updated successfully',
    data: updatedAnnouncement,
  });
});

// Delete announcement
export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return next(new BadRequestError('Announcement not found'));
  }

  await Announcement.findByIdAndUpdate(id, { isActive: false });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
});

// Mark announcement as read
export const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return next(new BadRequestError('Announcement not found'));
  }

  const isAlreadyRead = announcement.readBy.some(
    read => read.user.toString() === userId
  );

  if (!isAlreadyRead) {
    announcement.readBy.push({
      user: userId,
      readAt: new Date(),
    });
    await announcement.save();
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcement marked as read',
  });
});

// Get unread announcements
export const getUnreadAnnouncements = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { targetAudience, courseId } = req.query;

  let filter = { isActive: true };

  if (targetAudience) filter.targetAudience = targetAudience;
  if (courseId) filter.course = courseId;

  // If student, show relevant announcements
  if (req.user.role === 'student') {
    const studentCourses = await Course.find({
      students: userId,
      isActive: true,
    }).select('_id');

    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      { course: { $in: studentCourses.map(course => course._id) } },
    ];
  }

  // Filter out expired announcements
  filter.$and = [
    {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    },
  ];

  const announcements = await Announcement.find(filter)
    .populate('author', 'name email')
    .populate('course', 'courseName courseCode')
    .sort({ priority: -1, createdAt: -1 });

  // Filter out read announcements
  const unreadAnnouncements = announcements.filter(announcement => 
    !announcement.readBy.some(read => read.user.toString() === userId)
  );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Unread announcements retrieved successfully',
    data: unreadAnnouncements,
    meta: { count: unreadAnnouncements.length },
  });
});

// Get announcement statistics
export const getAnnouncementStats = catchAsync(async (req, res, next) => {
  const { author, courseId, semester } = req.query;

  let filter = { isActive: true };
  if (author) filter.author = author;
  if (courseId) filter.course = courseId;

  const totalAnnouncements = await Announcement.countDocuments(filter);
  
  const priorityStats = await Announcement.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  const audienceStats = await Announcement.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$targetAudience',
        count: { $sum: 1 },
      },
    },
  ]);

  const recentAnnouncements = await Announcement.find(filter)
    .populate('author', 'name')
    .populate('course', 'courseName')
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Announcement statistics retrieved successfully',
    data: {
      totalAnnouncements,
      priorityStats,
      audienceStats,
      recentAnnouncements,
    },
  });
});
