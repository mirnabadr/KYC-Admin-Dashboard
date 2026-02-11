/**
 * Rates Routes
 */
import express from 'express';
import { getRate } from '../controllers/ratesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Rates endpoint (can be public or protected, depending on requirements)
// For now, making it optional auth (works with or without token)
router.get('/', asyncHandler(getRate));

export default router;
