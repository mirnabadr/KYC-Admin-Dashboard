/**
 * Cybrid API Service
 * Integrates with Cybrid API for USD/USDC exchange rates
 * Uses OAuth 2.0 Bearer tokens for authentication
 * Falls back to mock if API credentials are not configured
 */
import { config } from '../config/env.js';
import { cache } from './cache.js';
import { getBearerToken } from './cybridTokenManager.js';

const CACHE_TTL = 60; // Cache rates for 60 seconds
const CACHE_KEY_PREFIX = 'cybrid_rate_';

/**
 * Call Cybrid API to get exchange rate
 * @param {string} from - Source currency (default: USD)
 * @param {string} to - Target currency (default: USDC)
 * @returns {Promise<object>} - Rate response with from, to, rate, timestamp
 */
export async function fetchRate(from = 'USD', to = 'USDC') {
  const cacheKey = `${CACHE_KEY_PREFIX}${from}_${to}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit for ${from}/${to} rate`);
    return cached;
  }

  // If API credentials are not configured, use mock
  if (!config.cybrid.apiKey || config.cybrid.apiKey === 'your-api-key' || !config.cybrid.apiSecret) {
    console.log(`🔧 Using mock rate for ${from}/${to} (Cybrid API credentials not configured)`);
    const mockRate = getMockRate(from, to);
    cache.set(cacheKey, mockRate, CACHE_TTL);
    return mockRate;
  }

  // Call real Cybrid API
  try {
    const rate = await callCybridAPI(from, to);
    cache.set(cacheKey, rate, CACHE_TTL);
    return rate;
  } catch (error) {
    console.error(`❌ Cybrid API error: ${error.message}. Falling back to mock.`);
    const mockRate = getMockRate(from, to);
    cache.set(cacheKey, mockRate, CACHE_TTL);
    return mockRate;
  }
}

/**
 * Call the real Cybrid API
 * Uses OAuth 2.0 Bearer token authentication
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 * @returns {Promise<object>} - Rate response
 */
async function callCybridAPI(from, to) {
  // Get OAuth bearer token
  const bearerToken = await getBearerToken();

  // Cybrid API endpoints:
  // Sandbox: https://api.sandbox.cybrid.app
  // Production: https://api.cybrid.app
  // For prices/rates, we use the /prices endpoint
  const isSandbox = config.cybrid.apiUrl.includes('sandbox');
  const apiBaseUrl = isSandbox
    ? 'https://api.sandbox.cybrid.app'
    : 'https://api.cybrid.app';

  // Cybrid uses /prices endpoint for exchange rates
  // Format: GET /prices?product_type=spot&symbol_pair=USD_USDC
  const symbolPair = `${from}_${to}`;
  const url = `${apiBaseUrl}/api/prices?product_type=spot&symbol_pair=${symbolPair}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
  };

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cybrid API returned ${response.status}: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  // Cybrid prices API returns an array of price objects
  // Each price object has: symbol_pair, buy_price, sell_price, etc.
  let rate = 1.0;
  let priceData = null;

  if (Array.isArray(data) && data.length > 0) {
    // Find the matching symbol pair
    priceData = data.find(p => p.symbol_pair === symbolPair);
    if (priceData) {
      // Use buy_price or sell_price (average for simplicity)
      rate = parseFloat(priceData.buy_price || priceData.sell_price || 1.0);
    }
  } else if (data.symbol_pair) {
    // Single price object
    priceData = data;
    rate = parseFloat(data.buy_price || data.sell_price || 1.0);
  }

  // Transform Cybrid response to our format
  return {
    from,
    to,
    rate,
    timestamp: priceData?.created_at || new Date().toISOString(),
  };
}

/**
 * Get mock rate (fallback)
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 * @returns {object} - Mock rate response
 */
function getMockRate(from, to) {
  // Mock rate: 1 USD = 1 USDC (stablecoin)
  return {
    from,
    to,
    rate: 1.0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear rate cache (useful for testing or forced refresh)
 */
export function clearRateCache() {
  const stats = cache.getStats();
  for (const key of stats.keys) {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      cache.delete(key);
    }
  }
}
