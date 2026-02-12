/**
 * AuditLog Model
 * Stores audit trail for compliance and security
 * Append-only: logs should never be deleted or modified
 */
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'Login',
      'Logout',
      'Create Transaction',
      'Approve Transaction',
      'Reject Transaction',
      'Update Transaction',
      'Update Role',
      'Add User',
      'Update User',
      'Delete User',
      'Fetch Rate',
      'View Audit Logs',
      'View Transactions',
      'View Users',
    ],
  },
  status: {
    type: String,
    required: true,
    enum: ['Success', 'Failure'],
  },
  details: {
    type: String,
    default: '',
  },
  // Resource information
  resourceId: {
    type: String,
  },
  resourceType: {
    type: String,
    enum: ['Transaction', 'User', 'Rate', 'AuditLog'],
  },
  region: {
    type: String,
    enum: ['US', 'EU', 'APAC', 'LATAM', 'All Regions'],
  },
  // IP address for security tracking
  ipAddress: {
    type: String,
  },
  // User agent for security tracking
  userAgent: {
    type: String,
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false, // We use custom timestamp field
});

// Indexes for performance and filtering
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ userEmail: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ region: 1, timestamp: -1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ timestamp: -1 }); // Most recent first

// Compound indexes for common queries
auditLogSchema.index({ userEmail: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ region: 1, action: 1, timestamp: -1 });

// Virtual for formatted timestamp (for frontend compatibility)
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString().replace('T', ' ').substring(0, 16);
});

// Ensure virtuals are included in JSON output
auditLogSchema.set('toJSON', { virtuals: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
