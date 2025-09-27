import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getStudentPerformance,
  getCoursePerformance,
  getPerformanceComparison,
  getAttendancePerformance,
  getPerformanceInsights,
} from '../controller/performance.js';

const router = express.Router();

// Performance routes
router.get('/student', auth, getStudentPerformance);
router.get('/course/:courseId', auth, getCoursePerformance);
router.get('/comparison', auth, getPerformanceComparison);
router.get('/attendance', auth, getAttendancePerformance);
router.get('/insights', auth, getPerformanceInsights);

export default router;
