/**
 * Users Controller
 * Handles user management (admin only)
 */
import { User } from '../models/User.js';
import { writeAuditLog, getClientIp } from '../services/auditService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Get all users
 * GET /api/users?role=Regional Admin&region=EU&page=1&limit=10
 */
export const getUsers = asyncHandler(async (req, res) => {
  const {
    role,
    region,
    isActive,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (region) {
    query.region = region;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  // Format response for frontend compatibility
  const formattedUsers = users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    region: user.region,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString().split('T')[0],
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
  }));

  res.json({
    success: true,
    data: formattedUsers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Get single user by ID
 * GET /api/users/:id
 */
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password').lean();

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    },
  });
});

/**
 * Create new user
 * POST /api/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, name, role, region } = req.body;

  // Validate required fields
  if (!email || !password || !name || !role || !region) {
    throw new AppError('Missing required fields: email, password, name, role, region', 400, 'VALIDATION_ERROR');
  }

  // Validate role
  const validRoles = ['Global Admin', 'Regional Admin', 'Sending Partner', 'Receiving Partner'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role', 400, 'VALIDATION_ERROR');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409, 'DUPLICATE_EMAIL');
  }

  // Create user
  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    role,
    region,
  });

  await user.save();

  // Log audit
  await writeAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'Add User',
    status: 'Success',
    details: `Added user ${email}`,
    resourceId: user._id.toString(),
    resourceType: 'User',
    ipAddress: getClientIp(req),
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update user
 * PATCH /api/users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, region, isActive } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Update fields
  if (name !== undefined) user.name = name;
  if (role !== undefined) {
    const validRoles = ['Global Admin', 'Regional Admin', 'Sending Partner', 'Receiving Partner'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400, 'VALIDATION_ERROR');
    }
    user.role = role;
  }
  if (region !== undefined) user.region = region;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  // Log audit
  await writeAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'Update User',
    status: 'Success',
    details: `Updated user ${user.email}`,
    resourceId: id,
    resourceType: 'User',
    ipAddress: getClientIp(req),
  });

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    },
  });
});
