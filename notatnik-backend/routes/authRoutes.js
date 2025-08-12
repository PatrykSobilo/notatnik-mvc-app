import express from 'express';
import { register, login, verifyToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/verify', authenticateToken, verifyToken);

router.post('/logout', logout);

export default router;
