/**
 * API Service - Frontend API client for backend
 * Handles all API calls to the backend with authentication
 */

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : 'http://localhost:3001';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  // Build headers object
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers if provided
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else {
      Object.assign(headersObj, options.headers);
    }
  }

  // Add authorization token if available
  if (token) {
    headersObj['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: headersObj,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  // Backend returns { success: true, data: [...], pagination: {...} }
  // Return the full response object so frontend can access both data and pagination
  if (data.success !== undefined) {
    // Return { data: [...], pagination: {...} } structure
    return {
      data: data.data || [],
      pagination: data.pagination || { page: 1, limit: 50, total: 0, pages: 1 },
    } as T;
  }
  // Fallback for other response formats
  return (data.data || data) as T;
}

/**
 * Transactions API
 */
export const transactionsApi = {
  getAll: async (filters?: {
    region?: string;
    status?: string;
    userEmail?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userEmail) params.append('userEmail', filters.userEmail);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiRequest<{
      data: Array<{
        id: string;
        date: string;
        user: string;
        region: string;
        amountUSD: number;
        amountUSDC: number;
        status: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/transactions?${params.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest<{
      id: string;
      date: string;
      user: string;
      region: string;
      amountUSD: number;
      amountUSDC: number;
      status: string;
    }>(`/api/transactions/${id}`);
  },

  create: async (data: {
    userEmail: string;
    region: string;
    amountUSD: number;
    amountUSDC: number;
  }) => {
    return apiRequest(`/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: 'Approved' | 'Rejected') => {
    return apiRequest(`/api/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

/**
 * Audit Logs API
 */
export const auditLogsApi = {
  getAll: async (filters?: {
    userEmail?: string;
    action?: string;
    status?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.userEmail) params.append('userEmail', filters.userEmail);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiRequest<{
      data: Array<{
        id: string;
        timestamp: string;
        user: string;
        action: string;
        status: string;
        details: string;
        region?: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/audit-logs?${params.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/audit-logs/${id}`);
  },
};

/**
 * Users API
 */
export const usersApi = {
  getAll: async (filters?: {
    role?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiRequest<{
      data: Array<{
        id: string;
        email: string;
        name: string;
        role: string;
        region: string;
        isActive: boolean;
        createdAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/users?${params.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/users/${id}`);
  },

  create: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    region: string;
  }) => {
    return apiRequest(`/api/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    role?: string;
    region?: string;
    isActive?: boolean;
  }) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Rates API
 */
export const ratesApi = {
  getRate: async (from: string = 'USD', to: string = 'USDC') => {
    return apiRequest<{
      from: string;
      to: string;
      rate: number;
      timestamp: string;
    }>(`/api/rates?from=${from}&to=${to}`);
  },
};
