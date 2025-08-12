import express from 'express';
import { register, login, verifyToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Rejestracja nowego użytkownika
router.post('/register', register);

// POST /api/auth/login - Logowanie użytkownika
router.post('/login', login);

// GET /api/auth/verify - Sprawdzenie czy token jest ważny
router.get('/verify', authenticateToken, verifyToken);

// POST /api/auth/logout - Wylogowanie (po stronie klienta)
router.post('/logout', logout);

export default router;
