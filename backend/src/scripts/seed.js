/**
 * Database Seeding Script
 * Creates initial users and sample transactions for testing
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Seed initial data
 */
async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data (optional - comment out in production)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const usersData = [
      {
        email: 'admin@kyc.com',
        password: 'admin123',
        name: 'Sarah Chen',
        role: 'Global Admin',
        region: 'All Regions',
      },
      {
        email: 'eu-admin@kyc.com',
        password: 'admin123',
        name: 'Marcus Weber',
        role: 'Regional Admin',
        region: 'EU',
      },
      {
        email: 'partner@kyc.com',
        password: 'partner123',
        name: 'Alex Johnson',
        role: 'Sending Partner',
        region: 'US',
      },
      {
        email: 'apac-admin@kyc.com',
        password: 'admin123',
        name: 'Yuki Tanaka',
        role: 'Regional Admin',
        region: 'APAC',
      },
      {
        email: 'latam-partner@kyc.com',
        password: 'partner123',
        name: 'Carlos Silva',
        role: 'Receiving Partner',
        region: 'LATAM',
      },
    ];

    // Hash passwords before inserting (insertMany doesn't trigger pre-save hooks)
    const users = await Promise.all(
      usersData.map(async (userData) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        return {
          ...userData,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create sample transactions
    console.log('💳 Creating sample transactions...');
    const transactions = [
      {
        transactionId: 'TXN-001',
        userId: createdUsers[2]._id, // partner@kyc.com
        userEmail: 'john.doe@example.com',
        region: 'US',
        amountUSD: 5000,
        amountUSDC: 5000,
        status: 'Approved',
        kycStatus: 'Approved',
        approvedAt: new Date('2026-02-10T14:23:00Z'),
        approvedBy: createdUsers[0]._id, // admin@kyc.com
      },
      {
        transactionId: 'TXN-002',
        userId: createdUsers[4]._id, // latam-partner@kyc.com
        userEmail: 'maria.garcia@example.com',
        region: 'LATAM',
        amountUSD: 12500,
        amountUSDC: 12500,
        status: 'Pending',
        kycStatus: 'Pending',
      },
      {
        transactionId: 'TXN-003',
        userId: createdUsers[1]._id, // eu-admin@kyc.com
        userEmail: 'hans.mueller@example.com',
        region: 'EU',
        amountUSD: 7800,
        amountUSDC: 7800,
        status: 'Approved',
        kycStatus: 'Approved',
        approvedAt: new Date('2026-02-10T12:18:00Z'),
        approvedBy: createdUsers[1]._id,
      },
      {
        transactionId: 'TXN-004',
        userId: createdUsers[3]._id, // apac-admin@kyc.com
        userEmail: 'yuki.tanaka@example.com',
        region: 'APAC',
        amountUSD: 3200,
        amountUSDC: 3200,
        status: 'Rejected',
        kycStatus: 'Rejected',
        rejectedAt: new Date('2026-02-10T11:02:00Z'),
        rejectedBy: createdUsers[0]._id,
      },
      {
        transactionId: 'TXN-005',
        userId: createdUsers[2]._id,
        userEmail: 'emma.wilson@example.com',
        region: 'US',
        amountUSD: 9500,
        amountUSDC: 9500,
        status: 'Pending',
        kycStatus: 'Pending',
      },
      {
        transactionId: 'TXN-006',
        userId: createdUsers[1]._id,
        userEmail: 'pierre.dubois@example.com',
        region: 'EU',
        amountUSD: 15000,
        amountUSDC: 15000,
        status: 'Approved',
        kycStatus: 'Approved',
        approvedAt: new Date('2026-02-09T16:45:00Z'),
        approvedBy: createdUsers[1]._id,
      },
      {
        transactionId: 'TXN-007',
        userId: createdUsers[4]._id,
        userEmail: 'carlos.silva@example.com',
        region: 'LATAM',
        amountUSD: 4300,
        amountUSDC: 4300,
        status: 'Approved',
        kycStatus: 'Approved',
        approvedAt: new Date('2026-02-09T15:22:00Z'),
        approvedBy: createdUsers[4]._id,
      },
      {
        transactionId: 'TXN-008',
        userId: createdUsers[2]._id,
        userEmail: 'lisa.anderson@example.com',
        region: 'US',
        amountUSD: 8900,
        amountUSDC: 8900,
        status: 'Pending',
        kycStatus: 'Pending',
      },
      {
        transactionId: 'TXN-009',
        userId: createdUsers[3]._id,
        userEmail: 'wei.zhang@example.com',
        region: 'APAC',
        amountUSD: 6700,
        amountUSDC: 6700,
        status: 'Approved',
        kycStatus: 'Approved',
        approvedAt: new Date('2026-02-09T13:05:00Z'),
        approvedBy: createdUsers[3]._id,
      },
      {
        transactionId: 'TXN-010',
        userId: createdUsers[1]._id,
        userEmail: 'sofia.rossi@example.com',
        region: 'EU',
        amountUSD: 11200,
        amountUSDC: 11200,
        status: 'Rejected',
        kycStatus: 'Rejected',
        rejectedAt: new Date('2026-02-09T11:30:00Z'),
        rejectedBy: createdUsers[1]._id,
      },
    ];

    // Set createdAt dates
    const dates = [
      new Date('2026-02-10T14:23:00Z'),
      new Date('2026-02-10T13:45:00Z'),
      new Date('2026-02-10T12:18:00Z'),
      new Date('2026-02-10T11:02:00Z'),
      new Date('2026-02-10T10:30:00Z'),
      new Date('2026-02-09T16:45:00Z'),
      new Date('2026-02-09T15:22:00Z'),
      new Date('2026-02-09T14:10:00Z'),
      new Date('2026-02-09T13:05:00Z'),
      new Date('2026-02-09T11:30:00Z'),
    ];

    transactions.forEach((txn, index) => {
      txn.createdAt = dates[index];
      txn.updatedAt = dates[index];
    });

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} transactions\n`);

    // Create sample audit logs
    console.log('📝 Creating sample audit logs...');
    const auditLogs = [
      {
        userId: createdUsers[0]._id,
        userEmail: 'admin@kyc.com',
        action: 'Login',
        status: 'Success',
        details: 'Logged in from 192.168.1.1',
        timestamp: new Date('2026-02-10T14:20:00Z'),
      },
      {
        userId: createdUsers[0]._id,
        userEmail: 'admin@kyc.com',
        action: 'Approve Transaction',
        status: 'Success',
        details: 'Approved TXN-001',
        resourceId: 'TXN-001',
        resourceType: 'Transaction',
        region: 'US',
        timestamp: new Date('2026-02-10T14:25:00Z'),
      },
      {
        userId: createdUsers[1]._id,
        userEmail: 'eu-admin@kyc.com',
        action: 'Login',
        status: 'Success',
        details: 'Logged in from 10.0.0.5',
        timestamp: new Date('2026-02-10T10:45:00Z'),
      },
      {
        userId: createdUsers[1]._id,
        userEmail: 'eu-admin@kyc.com',
        action: 'Approve Transaction',
        status: 'Success',
        details: 'Approved TXN-003',
        resourceId: 'TXN-003',
        resourceType: 'Transaction',
        region: 'EU',
        timestamp: new Date('2026-02-10T13:50:00Z'),
      },
      {
        userId: createdUsers[2]._id,
        userEmail: 'partner@kyc.com',
        action: 'Create Transaction',
        status: 'Success',
        details: 'Created TXN-002',
        resourceId: 'TXN-002',
        resourceType: 'Transaction',
        region: 'LATAM',
        timestamp: new Date('2026-02-10T12:30:00Z'),
      },
      {
        userId: createdUsers[0]._id,
        userEmail: 'admin@kyc.com',
        action: 'Reject Transaction',
        status: 'Success',
        details: 'Rejected TXN-004',
        resourceId: 'TXN-004',
        resourceType: 'Transaction',
        region: 'APAC',
        timestamp: new Date('2026-02-10T11:15:00Z'),
      },
    ];

    const createdAuditLogs = await AuditLog.insertMany(auditLogs);
    console.log(`✅ Created ${createdAuditLogs.length} audit logs\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📋 Test accounts:');
    console.log('   Global Admin: admin@kyc.com / admin123');
    console.log('   Regional Admin (EU): eu-admin@kyc.com / admin123');
    console.log('   Sending Partner (US): partner@kyc.com / partner123');
    console.log('   Regional Admin (APAC): apac-admin@kyc.com / admin123');
    console.log('   Receiving Partner (LATAM): latam-partner@kyc.com / partner123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run seeding
seed()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
