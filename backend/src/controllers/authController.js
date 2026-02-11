/**
 * Authentication Controller
 * Handles login, logout, and token management
 */
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { writeAuditLog, getClientIp, getUserAgent } from '../services/auditService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Login endpoint handler
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  // Find user with password field included
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    // Log failed login attempt
    await writeAuditLog({
      userEmail: email,
      action: 'Login',
      status: 'Failure',
      details: 'User not found',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    throw new AppError('Invalid email or password', 401, 'AUTHENTICATION_ERROR');
  }

  // Check if user is active
  if (!user.isActive) {
    await writeAuditLog({
      userId: user._id,
      userEmail: user.email,
      action: 'Login',
      status: 'Failure',
      details: 'Account is inactive',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    throw new AppError('Account is inactive. Please contact administrator.', 403, 'ACCOUNT_INACTIVE');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Log failed login attempt
    await writeAuditLog({
      userId: user._id,
      userEmail: user.email,
      action: 'Login',
      status: 'Failure',
      details: 'Invalid password',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    throw new AppError('Invalid email or password', 401, 'AUTHENTICATION_ERROR');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user);

  // Log successful login
  await writeAuditLog({
    userId: user._id,
    userEmail: user.email,
    action: 'Login',
    status: 'Success',
    details: 'User logged in successfully',
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  // Return token and user info (without password)
  res.json({
    success: true,
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
    },
  });
});

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is already attached by authenticateToken middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});
