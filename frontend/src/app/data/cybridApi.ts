/**
 * Cybrid API integration for USD/USDC rates.
 * Uses backend proxy when VITE_API_URL is set (backend calls Cybrid with keys from .env).
 * Falls back to mock when backend is not running or VITE_API_URL is not set.
 */
export interface CybridRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : '';

export async function fetchUSDtoUSDCRate(): Promise<CybridRate> {
  if (API_BASE) {
    try {
      const res = await fetch(
        `${API_BASE}/api/rates?from=USD&to=USDC`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      return {
        from: data.from ?? 'USD',
        to: data.to ?? 'USDC',
        rate: Number(data.rate ?? 1),
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
    } catch {
      return getMockRate();
    }
  }
  return getMockRate();
}

function getMockRate(): CybridRate {
  return {
    from: 'USD',
    to: 'USDC',
    rate: 1.0,
    timestamp: new Date().toISOString(),
  };
}

/** Poll interval in ms for real-time rate updates (15 seconds) */
const RATE_POLL_INTERVAL_MS = 10 * 1000;

/**
 * Subscribe to live rate updates from the API (Beeceptor/backend).
 * Call the returned function to stop polling.
 */
export function subscribeToRateUpdates(callback: (rate: CybridRate) => void) {
  const interval = setInterval(async () => {
    const rate = await fetchUSDtoUSDCRate();
    callback(rate);
  }, RATE_POLL_INTERVAL_MS);
  return () => clearInterval(interval);
}
