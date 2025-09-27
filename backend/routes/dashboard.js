import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
} from '../controller/dashboard.js';

const router = express.Router();

// Dashboard routes
router.get('/student', auth, getStudentDashboard);
router.get('/teacher', auth, getTeacherDashboard);
router.get('/admin', auth, getAdminDashboard);

export default router;
