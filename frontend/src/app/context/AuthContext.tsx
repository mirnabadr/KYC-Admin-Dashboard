import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Get API base URL from environment
  const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
    : 'http://localhost:3001';

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call backend API
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Fallback to mock if backend is not available
        if (response.status === 0 || response.status >= 500) {
          console.warn('Backend unavailable, using mock authentication');
          return mockLogin(email, password);
        }
        return false;
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Set user from response
      if (data.user) {
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock if backend is not available
      return mockLogin(email, password);
    }
  };

  // Mock authentication fallback (for development when backend is not running)
  const mockLogin = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUsers: Record<string, { password: string; user: User }> = {
      'admin@kyc.com': {
        password: 'admin123',
        user: {
          email: 'admin@kyc.com',
          role: 'Global Admin',
          region: 'All Regions',
          name: 'Sarah Chen'
        }
      },
      'eu-admin@kyc.com': {
        password: 'admin123',
        user: {
          email: 'eu-admin@kyc.com',
          role: 'Regional Admin',
          region: 'EU',
          name: 'Marcus Weber'
        }
      },
      'partner@kyc.com': {
        password: 'partner123',
        user: {
          email: 'partner@kyc.com',
          role: 'Sending Partner',
          region: 'US',
          name: 'Alex Johnson'
        }
      }
    };

    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  // Check for existing token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        });
    }
  }, [API_BASE]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
