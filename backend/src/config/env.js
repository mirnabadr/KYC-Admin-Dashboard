/**
 * Environment configuration validation
 * Ensures all required environment variables are set
 */
import 'dotenv/config';

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
];

const optionalEnvVars = {
  CYBRID_API_URL: 'https://api.sandbox.cybrid.app', // Default to sandbox
  CYBRID_API_VERSION: 'v1',
  CYBRID_CLIENT_ID: '', // OAuth Client ID (from Cybrid Partner Portal)
  CYBRID_CLIENT_SECRET: '', // OAuth Client Secret (from Cybrid Partner Portal)
  // Legacy support (will use CLIENT_ID/SECRET if available)
  CYBRID_API_KEY: '',
  CYBRID_API_SECRET: '',
  NODE_ENV: 'development',
};

/**
 * Validate and export environment configuration
 */
export const config = {
  // Required
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Default 24 hours
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  // Optional - Cybrid API (OAuth 2.0)
  cybrid: {
    apiUrl: process.env.CYBRID_API_URL || optionalEnvVars.CYBRID_API_URL,
    apiVersion: process.env.CYBRID_API_VERSION || optionalEnvVars.CYBRID_API_VERSION,
    // Use CLIENT_ID/CLIENT_SECRET (new) or fallback to API_KEY/API_SECRET (legacy)
    apiKey: process.env.CYBRID_CLIENT_ID || process.env.CYBRID_API_KEY || optionalEnvVars.CYBRID_CLIENT_ID,
    apiSecret: process.env.CYBRID_CLIENT_SECRET || process.env.CYBRID_API_SECRET || optionalEnvVars.CYBRID_CLIENT_SECRET,
  },
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
    credentials: true,
  },
};

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Log configuration (without secrets)
console.log('📋 Configuration loaded:');
console.log(`   - Server Port: ${config.server.port}`);
console.log(`   - Node Environment: ${config.server.nodeEnv}`);
console.log(`   - MongoDB URI: ${config.mongodb.uri ? '✅ Set' : '❌ Missing'}`);
console.log(`   - JWT Secret: ${config.jwt.secret ? '✅ Set' : '❌ Missing'}`);
console.log(`   - Cybrid API URL: ${config.cybrid.apiUrl}`);
console.log(`   - CORS Origin: ${config.cors.origin}`);
