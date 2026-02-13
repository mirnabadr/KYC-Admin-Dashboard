/**
 * KYC Admin Backend Server
 * Express server with MongoDB, JWT auth, RBAC, and audit logging
 * Supports both standalone (local dev) and Vercel serverless deployment
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { connectDatabase, closeDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import ratesRoutes from './routes/ratesRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import auditLogsRoutes from './routes/auditLogsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Rate limiting (prevent abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware for serverless (connects once, reuses)
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KYC Admin Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Export the Express app for Vercel serverless
export default app;

// Start server only when running standalone (not on Vercel)
if (!process.env.VERCEL) {
  async function startServer() {
    try {
      // Connect to MongoDB
      await connectDatabase();

      // Start HTTP server
      const server = app.listen(config.server.port, () => {
        console.log('\n🚀 KYC Admin Backend Server');
        console.log(`   - Environment: ${config.server.nodeEnv}`);
        console.log(`   - Server running on http://localhost:${config.server.port}`);
        console.log(`   - Health check: http://localhost:${config.server.port}/health`);
        console.log(`   - API base: http://localhost:${config.server.port}/api`);
        console.log('\n📋 Available endpoints:');
        console.log('   POST   /api/auth/login');
        console.log('   GET    /api/auth/me');
        console.log('   GET    /api/rates?from=USD&to=USDC');
        console.log('   GET    /api/transactions');
        console.log('   GET    /api/transactions/:id');
        console.log('   POST   /api/transactions');
        console.log('   PATCH  /api/transactions/:id/status');
        console.log('   GET    /api/audit-logs');
        console.log('   GET    /api/users');
        console.log('\n');
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
        server.close(async () => {
          console.log('✅ HTTP server closed');
          await closeDatabase();
          process.exit(0);
        });
      });

      process.on('SIGINT', async () => {
        console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
        server.close(async () => {
          console.log('✅ HTTP server closed');
          await closeDatabase();
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}
