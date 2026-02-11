/**
 * User Model
 * Stores user credentials, roles, and region assignments
 * Supports RBAC: Global Admin, Regional Admin, Sending Partner, Receiving Partner
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    // Never return password in queries by default
    select: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['Global Admin', 'Regional Admin', 'Sending Partner', 'Receiving Partner'],
    index: true,
  },
  region: {
    type: String,
    required: true,
    enum: ['All Regions', 'US', 'EU', 'APAC', 'LATAM'],
    default: 'All Regions',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user without sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, region: 1 });
userSchema.index({ isActive: 1 });

export const User = mongoose.model('User', userSchema);
