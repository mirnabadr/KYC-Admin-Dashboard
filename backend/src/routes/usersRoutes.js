/**
 * Users Routes (Admin only)
 */
import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
} from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireGlobalAdmin } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication and Global Admin role
router.use(authenticateToken);
router.use(requireGlobalAdmin);

// Get all users
router.get('/', asyncHandler(getUsers));

// Get single user
router.get('/:id', asyncHandler(getUser));

// Create user
router.post('/', asyncHandler(createUser));

// Update user
router.patch('/:id', asyncHandler(updateUser));

export default router;
