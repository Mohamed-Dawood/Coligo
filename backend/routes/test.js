import express from 'express';
import { auth } from '../middleware/authentication.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Announcement from '../models/Announcement.js';
import Grade from '../models/Grade.js';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Test endpoint to verify data
router.get('/data', auth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    const courses = await Course.find({}).populate('instructor', 'name email');
    const quizzes = await Quiz.find({}).populate('course', 'courseName courseCode');
    const announcements = await Announcement.find({}).populate('author', 'name');
    const grades = await Grade.find({}).populate('student', 'name studentId');
    const schedules = await Schedule.find({}).populate('course', 'courseName courseCode');

    res.json({
      success: true,
      message: 'Sample data retrieved successfully',
      data: {
        users: users.length,
        courses: courses.length,
        quizzes: quizzes.length,
        announcements: announcements.length,
        grades: grades.length,
        schedules: schedules.length,
      },
      sample: {
        users: users.slice(0, 3),
        courses: courses.slice(0, 2),
        quizzes: quizzes.slice(0, 2),
        announcements: announcements.slice(0, 2),
        grades: grades.slice(0, 3),
        schedules: schedules.slice(0, 3),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving data',
      error: error.message,
    });
  }
});

export default router;
