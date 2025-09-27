import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getStudentSchedule,
  getScheduleByDay,
  getTodaysSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getWeeklySchedule,
} from '../controller/schedule.js';

const router = express.Router();

// Schedule routes
router.get('/', auth, getStudentSchedule);
router.get('/day/:day', auth, getScheduleByDay);
router.get('/today', auth, getTodaysSchedule);
router.get('/weekly', auth, getWeeklySchedule);
router.post('/', auth, createSchedule);
router.put('/:id', auth, updateSchedule);
router.delete('/:id', auth, deleteSchedule);

export default router;
