/**
 * Transactions Routes
 */
import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransactionStatus,
} from '../controllers/transactionsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all transactions
router.get('/', asyncHandler(getTransactions));

// Get single transaction
router.get('/:id', asyncHandler(getTransaction));

// Create transaction
router.post('/', asyncHandler(createTransaction));

// Update transaction status (Approve/Reject) - Admin only
router.patch('/:id/status', requireAdmin, asyncHandler(updateTransactionStatus));

export default router;
