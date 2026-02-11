/**
 * Audit Logs Routes
 */
import express from 'express';
import { getAuditLogs, getAuditLog } from '../controllers/auditLogsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all audit logs
router.get('/', asyncHandler(getAuditLogs));

// Get single audit log
router.get('/:id', asyncHandler(getAuditLog));

export default router;
