/* @refresh reset */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Global Admin' | 'Regional Admin' | 'Sending Partner' | 'Receiving Partner';
export type Region = 'All Regions' | 'US' | 'EU' | 'APAC' | 'LATAM';

export interface User {
  email: string;
  role: UserRole;
  region: Region;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** API base URL - points to the backend server */
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Login via backend JWT authentication.
   * No mock fallback - the backend MUST be running.
   * Throws descriptive errors for the UI to display.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    let response: Response;

    try {
      response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      // Network error - backend is not running
      throw new Error('Cannot connect to the backend server. Please ensure the backend is running on ' + API_BASE);
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password');
    }

    // Store JWT token
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    // Set authenticated user from backend response
    if (data.user) {
      setUser(data.user);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  // On mount, verify existing JWT token with the backend
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
