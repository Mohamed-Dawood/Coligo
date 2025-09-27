import express from 'express';
import { getAllUsers, login, register } from '../controller/auth.js';
import { auth } from '../middleware/authentication.js';

const router = express.Router();

router.route('/').get(auth, getAllUsers);
router.route('/register').post(register);
router.route('/login').post(login);

export default router;
