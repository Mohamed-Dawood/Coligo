import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getStudentGrades,
  getGradesByCourse,
  addGrade,
  updateGrade,
  deleteGrade,
  getGradeStatistics,
  getStudentCourseGrades,
} from '../controller/gradebook.js';

const router = express.Router();

// Gradebook routes
router.get('/student', auth, getStudentGrades);
router.get('/student/course/:courseId', auth, getStudentCourseGrades);
router.get('/course/:courseId', auth, getGradesByCourse);
router.get('/course/:courseId/statistics', auth, getGradeStatistics);
router.post('/', auth, addGrade);
router.put('/:id', auth, updateGrade);
router.delete('/:id', auth, deleteGrade);

export default router;
