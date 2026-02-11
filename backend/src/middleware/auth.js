/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Middleware to verify JWT token
 * Attaches user object to req.user if token is valid
 */
export async function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired. Please login again.',
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please login again.',
        });
      }
      throw error;
    }

    // Get user from database (to ensure user still exists and is active)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Token is invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive. Please contact administrator.',
      });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed. Please try again.',
    });
  }
}

/**
 * Generate JWT token for a user
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
export function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    region: user.region,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}
