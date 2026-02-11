/**
 * Authentication Routes
 */
import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.post('/login', asyncHandler(login));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(getMe));

export default router;
