/**
 * Transactions Controller
 * Handles transaction CRUD operations with RBAC
 */
import { Transaction } from '../models/Transaction.js';
import { writeAuditLog, getClientIp } from '../services/auditService.js';
import { applyRegionFilter, canAccessResource } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Get all transactions with filters
 * GET /api/transactions?region=US&status=Pending&page=1&limit=10
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const {
    region,
    status,
    userEmail,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = {};

  // Apply region filter based on user role
  applyRegionFilter(query, req.user);

  // Additional filters
  if (region) {
    // Check if user can access this region
    if (!canAccessResource(req.user, region)) {
      throw new AppError('Access denied for this region', 403, 'ACCESS_DENIED');
    }
    query.region = region;
  }

  if (status) {
    query.status = status;
  }

  if (userEmail) {
    query.userEmail = userEmail.toLowerCase();
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'email name')
      .lean(),
    Transaction.countDocuments(query),
  ]);

  // Format response for frontend compatibility
  const formattedTransactions = transactions.map(txn => ({
    id: txn.transactionId,
    date: txn.date || txn.createdAt.toISOString().replace('T', ' ').substring(0, 16),
    user: txn.userEmail,
    region: txn.region,
    amountUSD: txn.amountUSD,
    amountUSDC: txn.amountUSDC,
    status: txn.status,
  }));

  res.json({
    success: true,
    data: formattedTransactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Get single transaction by ID
 * GET /api/transactions/:id
 */
export const getTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({ transactionId: id })
    .populate('userId', 'email name')
    .populate('approvedBy', 'email name')
    .populate('rejectedBy', 'email name')
    .lean();

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  // Check region access
  if (!canAccessResource(req.user, transaction.region)) {
    throw new AppError('Access denied for this transaction', 403, 'ACCESS_DENIED');
  }

  // Format response
  const formatted = {
    id: transaction.transactionId,
    date: transaction.date || transaction.createdAt.toISOString().replace('T', ' ').substring(0, 16),
    user: transaction.userEmail,
    region: transaction.region,
    amountUSD: transaction.amountUSD,
    amountUSDC: transaction.amountUSDC,
    status: transaction.status,
    kycStatus: transaction.kycStatus,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };

  res.json({
    success: true,
    data: formatted,
  });
});

/**
 * Get transaction status by ID
 * GET /api/transactions/:id/status
 */
export const getTransactionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({ transactionId: id }).lean();

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  // Check region access
  if (!canAccessResource(req.user, transaction.region)) {
    throw new AppError('Access denied for this transaction', 403, 'ACCESS_DENIED');
  }

  res.json({
    success: true,
    data: {
      id: transaction.transactionId,
      status: transaction.status,
      kycStatus: transaction.kycStatus,
      updatedAt: transaction.updatedAt,
    },
  });
});

/**
 * Create new transaction
 * POST /api/transactions
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const { userEmail, region, amountUSD, amountUSDC, metadata } = req.body;

  // Validate required fields
  if (!userEmail || !region || amountUSD === undefined || amountUSDC === undefined) {
    throw new AppError('Missing required fields: userEmail, region, amountUSD, amountUSDC', 400, 'VALIDATION_ERROR');
  }

  // Validate region
  const validRegions = ['US', 'EU', 'APAC', 'LATAM'];
  if (!validRegions.includes(region)) {
    throw new AppError('Invalid region', 400, 'VALIDATION_ERROR');
  }

  // Check region access
  if (!canAccessResource(req.user, region)) {
    throw new AppError('Access denied for this region', 403, 'ACCESS_DENIED');
  }

  // Generate transaction ID
  const transactionId = `TXN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Create transaction
  const transaction = new Transaction({
    transactionId,
    userId: req.user.id,
    userEmail: userEmail.toLowerCase(),
    region,
    amountUSD: parseFloat(amountUSD),
    amountUSDC: parseFloat(amountUSDC),
    status: 'Pending',
    kycStatus: 'Pending',
    metadata: metadata || {},
  });

  await transaction.save();

  // Log audit
  await writeAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'Create Transaction',
    status: 'Success',
    details: `Created transaction ${transactionId}`,
    resourceId: transactionId,
    resourceType: 'Transaction',
    region,
    ipAddress: getClientIp(req),
  });

  res.status(201).json({
    success: true,
    data: {
      id: transaction.transactionId,
      date: transaction.date,
      user: transaction.userEmail,
      region: transaction.region,
      amountUSD: transaction.amountUSD,
      amountUSDC: transaction.amountUSDC,
      status: transaction.status,
    },
  });
});

/**
 * Update transaction status (Approve/Reject)
 * PATCH /api/transactions/:id/status
 */
export const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Must be Approved or Rejected', 400, 'VALIDATION_ERROR');
  }

  // Check permissions (only admins can approve/reject)
  const allowedRoles = ['Global Admin', 'Regional Admin'];
  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError('Only admins can approve or reject transactions', 403, 'ACCESS_DENIED');
  }

  // Find transaction
  const transaction = await Transaction.findOne({ transactionId: id });

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'NOT_FOUND');
  }

  // Check region access
  if (!canAccessResource(req.user, transaction.region)) {
    throw new AppError('Access denied for this transaction', 403, 'ACCESS_DENIED');
  }

  // Update status
  transaction.status = status;
  transaction.kycStatus = status;

  if (status === 'Approved') {
    transaction.approvedAt = new Date();
    transaction.approvedBy = req.user.id;
  } else if (status === 'Rejected') {
    transaction.rejectedAt = new Date();
    transaction.rejectedBy = req.user.id;
  }

  await transaction.save();

  // Log audit
  const action = status === 'Approved' ? 'Approve Transaction' : 'Reject Transaction';
  await writeAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action,
    status: 'Success',
    details: `${action} ${id}`,
    resourceId: id,
    resourceType: 'Transaction',
    region: transaction.region,
    ipAddress: getClientIp(req),
  });

  res.json({
    success: true,
    data: {
      id: transaction.transactionId,
      date: transaction.date,
      user: transaction.userEmail,
      region: transaction.region,
      amountUSD: transaction.amountUSD,
      amountUSDC: transaction.amountUSDC,
      status: transaction.status,
    },
  });
});
