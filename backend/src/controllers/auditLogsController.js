/**
 * Audit Logs Controller
 * Handles audit log queries with RBAC
 */
import { AuditLog } from '../models/AuditLog.js';
import { applyRegionFilter } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Get audit logs with filters
 * GET /api/audit-logs?userEmail=admin@kyc.com&action=Login&status=Success&page=1&limit=10
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    userEmail,
    action,
    status,
    region,
    resourceId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = {};

  // Apply region filter based on user role
  applyRegionFilter(query, req.user);

  // Additional filters
  if (userEmail) {
    query.userEmail = userEmail.toLowerCase();
  }

  if (action) {
    query.action = action;
  }

  if (status) {
    query.status = status;
  }

  if (region) {
    query.region = region;
  }

  if (resourceId) {
    query.resourceId = resourceId;
  }

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'email name')
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  // Format response for frontend compatibility
  const formattedLogs = logs.map(log => ({
    id: log._id.toString(),
    timestamp: log.formattedTimestamp || log.timestamp.toISOString().replace('T', ' ').substring(0, 16),
    user: log.userEmail,
    action: log.action,
    status: log.status,
    details: log.details,
    region: log.region,
    resourceId: log.resourceId,
  }));

  res.json({
    success: true,
    data: formattedLogs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Get single audit log by ID
 * GET /api/audit-logs/:id
 */
export const getAuditLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await AuditLog.findById(id)
    .populate('userId', 'email name')
    .lean();

  if (!log) {
    throw new AppError('Audit log not found', 404, 'NOT_FOUND');
  }

  // Check region access
  if (log.region && log.region !== 'All Regions') {
    if (req.user.role !== 'Global Admin' && req.user.region !== log.region) {
      throw new AppError('Access denied for this audit log', 403, 'ACCESS_DENIED');
    }
  }

  res.json({
    success: true,
    data: {
      id: log._id.toString(),
      timestamp: log.formattedTimestamp || log.timestamp.toISOString().replace('T', ' ').substring(0, 16),
      user: log.userEmail,
      action: log.action,
      status: log.status,
      details: log.details,
      region: log.region,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    },
  });
});
