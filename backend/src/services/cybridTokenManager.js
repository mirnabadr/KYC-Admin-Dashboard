/**
 * Cybrid OAuth Token Manager
 * Handles OAuth 2.0 token generation and caching for Cybrid API
 * Tokens are cached based on expires_in value (typically 30 minutes)
 */
import { config } from '../config/env.js';
import { cache } from './cache.js';

const TOKEN_CACHE_KEY = 'cybrid_oauth_token';
const TOKEN_CACHE_TTL = 25 * 60; // 25 minutes (tokens typically expire in 30 minutes)

/**
 * Get OAuth bearer token (cached or newly generated)
 * @returns {Promise<string>} - Bearer token
 */
export async function getBearerToken() {
  // Check cache first
  const cachedToken = cache.get(TOKEN_CACHE_KEY);
  if (cachedToken && cachedToken.token && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  // Generate new token
  return await generateBearerToken();
}

/**
 * Generate a new OAuth bearer token from Cybrid
 * Uses OAuth 2.0 Client Credentials Grant flow
 * @returns {Promise<string>} - Bearer token
 */
async function generateBearerToken() {
  const { cybrid } = config;

  if (!cybrid.apiKey || !cybrid.apiSecret || cybrid.apiKey === 'your-api-key') {
    throw new Error('Cybrid API credentials not configured');
  }

  // Determine OAuth endpoint (sandbox vs production)
  // Sandbox: https://id.sandbox.cybrid.app/oauth/token
  // Production: https://id.cybrid.app/oauth/token
  const isSandbox = cybrid.apiUrl.includes('sandbox');
  const oauthUrl = isSandbox
    ? 'https://id.sandbox.cybrid.app/oauth/token'
    : 'https://id.cybrid.app/oauth/token';

  // OAuth Client Credentials Grant flow
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: cybrid.apiKey, // Client ID
    client_secret: cybrid.apiSecret, // Client Secret
    scope: 'prices:read', // Read scope for prices/rates
  });

  try {
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('No access_token in OAuth response');
    }

    // Cache the token
    const expiresIn = data.expires_in || 1800; // Default 30 minutes if not provided
    const expiresAt = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000); // Expire 5 minutes early for safety

    cache.set(TOKEN_CACHE_KEY, {
      token: data.access_token,
      expiresAt,
    }, TOKEN_CACHE_TTL);

    console.log('✅ Cybrid OAuth token generated and cached');
    return data.access_token;

  } catch (error) {
    console.error('❌ Failed to generate Cybrid OAuth token:', error.message);
    throw error;
  }
}

/**
 * Clear cached token (force refresh on next request)
 */
export function clearToken() {
  cache.delete(TOKEN_CACHE_KEY);
}
