/**
 * Transaction Model
 * Stores transaction data with KYC status, amounts, regions, and user associations
 */
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
    enum: ['US', 'EU', 'APAC', 'LATAM'],
  },
  amountUSD: {
    type: Number,
    required: true,
    min: 0,
  },
  amountUSDC: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  // KYC-related fields
  kycStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Under Review'],
    default: 'Pending',
  },
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Update updatedAt on save
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance and filtering
// Note: transactionId already has unique: true which creates an index automatically
transactionSchema.index({ userId: 1 });
transactionSchema.index({ userEmail: 1 });
transactionSchema.index({ region: 1, status: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ region: 1, createdAt: -1 }); // Compound index for regional queries

// Virtual for formatted date (for frontend compatibility)
transactionSchema.virtual('date').get(function() {
  return this.createdAt.toISOString().replace('T', ' ').substring(0, 16);
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
