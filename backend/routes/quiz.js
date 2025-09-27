import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizResults,
  getUpcomingQuizzes,
  getQuizStatistics,
} from '../controller/quiz.js';

const router = express.Router();

// Quiz routes
router.get('/', auth, getAllQuizzes);
router.get('/upcoming', auth, getUpcomingQuizzes);
router.get('/:id', auth, getQuizById);
router.get('/:id/results', auth, getQuizResults);
router.get('/:id/statistics', auth, getQuizStatistics);
router.post('/', auth, createQuiz);
router.post('/:id/submit', auth, submitQuizAttempt);
router.put('/:id', auth, updateQuiz);
router.delete('/:id', auth, deleteQuiz);

export default router;
