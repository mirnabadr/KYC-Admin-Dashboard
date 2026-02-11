/**
 * Audit Service
 * Centralized audit logging with guaranteed write integrity
 * All audit logs are written synchronously to ensure compliance
 */
import { AuditLog } from '../models/AuditLog.js';

/**
 * Write an audit log entry
 * This is synchronous to ensure audit trail integrity (no lost logs)
 * @param {object} auditData - Audit log data
 * @param {string} auditData.userId - User ID (optional)
 * @param {string} auditData.userEmail - User email (required)
 * @param {string} auditData.action - Action performed
 * @param {string} auditData.status - Success or Failure
 * @param {string} auditData.details - Additional details
 * @param {string} auditData.resourceId - Resource ID (optional)
 * @param {string} auditData.resourceType - Resource type (optional)
 * @param {string} auditData.region - Region (optional)
 * @param {string} auditData.ipAddress - IP address (optional)
 * @param {string} auditData.userAgent - User agent (optional)
 * @param {object} auditData.metadata - Additional metadata (optional)
 * @returns {Promise<object>} - Created audit log
 */
export async function writeAuditLog(auditData) {
  try {
    const {
      userId,
      userEmail,
      action,
      status,
      details = '',
      resourceId,
      resourceType,
      region,
      ipAddress,
      userAgent,
      metadata = {},
    } = auditData;

    // Validate required fields
    if (!userEmail || !action || !status) {
      throw new Error('Missing required audit log fields: userEmail, action, status');
    }

    // Create audit log entry
    const auditLog = new AuditLog({
      userId,
      userEmail,
      action,
      status,
      details,
      resourceId,
      resourceType,
      region,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date(),
    });

    // Save synchronously (await ensures write completes)
    const savedLog = await auditLog.save();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Audit: ${action} by ${userEmail} - ${status}`);
    }

    return savedLog;
  } catch (error) {
    // Audit logging failures are critical - log to console
    console.error('❌ Failed to write audit log:', error);
    // In production, you might want to send to a monitoring service
    // For now, we throw to ensure the error is noticed
    throw error;
  }
}

/**
 * Extract IP address from Express request
 * @param {object} req - Express request object
 * @returns {string} - IP address
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Extract user agent from Express request
 * @param {object} req - Express request object
 * @returns {string} - User agent
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}
