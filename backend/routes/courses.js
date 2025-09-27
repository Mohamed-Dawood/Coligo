import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  enrollStudent,
  removeStudent,
  getCourseSchedule,
  deleteCourse,
  getCoursesByDepartment,
} from '../controller/courses.js';

const router = express.Router();

// Course routes
router.get('/', auth, getAllCourses);
router.get('/department/:department', auth, getCoursesByDepartment);
router.get('/:id', auth, getCourseById);
router.get('/:id/schedule', auth, getCourseSchedule);
router.post('/', auth, createCourse);
router.put('/:id', auth, updateCourse);
router.post('/:courseId/enroll', auth, enrollStudent);
router.post('/:courseId/remove', auth, removeStudent);
router.delete('/:id', auth, deleteCourse);

export default router;
