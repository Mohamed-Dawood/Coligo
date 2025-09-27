import express from 'express';
import { auth } from '../middleware/authentication.js';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  getUnreadAnnouncements,
  getAnnouncementStats,
} from '../controller/announcement.js';

const router = express.Router();

// Announcement routes
router.get('/', auth, getAllAnnouncements);
router.get('/unread', auth, getUnreadAnnouncements);
router.get('/stats', auth, getAnnouncementStats);
router.get('/:id', auth, getAnnouncementById);
router.post('/', auth, createAnnouncement);
router.put('/:id', auth, updateAnnouncement);
router.post('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteAnnouncement);

export default router;
