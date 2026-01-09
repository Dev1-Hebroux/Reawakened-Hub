import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  authProvider: string | null;
  emailVerifiedAt: Date | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasPassword: boolean;
  canAddPassword: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginWithReplit: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  addPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_KEY = 'reawakened_auth_cache';
const CACHE_TTL = 5 * 60 * 1000;

function getCachedAuth(): User | null {
  try {
    const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;
    
    const { user, timestamp } = JSON.parse(cached);
    
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

function setCachedAuth(user: User | null): void {
  if (user) {
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
      user,
      timestamp: Date.now(),
    }));
  } else {
    sessionStorage.removeItem(AUTH_CACHE_KEY);
  }
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

let csrfPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  let token = getCsrfToken();
  if (token) return token;
  
  if (csrfPromise) return csrfPromise;
  
  csrfPromise = fetch('/api/auth/csrf', { credentials: 'include' })
    .then(response => {
      if (response.ok) {
        return getCsrfToken();
      }
      return null;
    })
    .catch(err => {
      console.error('Failed to fetch CSRF token:', err);
      return null;
    })
    .finally(() => {
      csrfPromise = null;
    });
  
  return csrfPromise;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.method && options.method !== 'GET') {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadingRef = useRef(false);
  
  const [user, setUser] = useState<User | null>(() => getCachedAuth());
  const [isLoading, setIsLoading] = useState(() => !getCachedAuth());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureCsrfToken().catch(() => {});
  }, []);

  const refreshUser = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      const response = await authFetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCachedAuth(data.user);
      } else {
        setUser(null);
        setCachedAuth(null);
      }
    } catch (err) {
      setUser(null);
      setCachedAuth(null);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const response = await authFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error };
      }

      setUser(data.user);
      setCachedAuth(data.user);
      return { success: true };
    } catch (err) {
      const message = 'An error occurred during login';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setError(null);
    try {
      const response = await authFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }

      setUser(result.user);
      setCachedAuth(result.user);
      return { success: true };
    } catch (err) {
      const message = 'An error occurred during registration';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setCachedAuth(null);
    }
  };

  const loginWithReplit = () => {
    window.location.href = '/api/login';
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true };
    } catch (err) {
      return { success: true };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await authFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const addPassword = async (password: string) => {
    try {
      const response = await authFetch('/api/auth/add-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      await refreshUser();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to add password' };
    }
  };

  const clearError = () => setError(null);

  const hasPassword = user?.authProvider === 'email' || user?.authProvider === 'both';
  const canAddPassword = user?.authProvider === 'replit' && !!user?.email;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    hasPassword,
    canAddPassword,
    login,
    register,
    logout,
    loginWithReplit,
    requestPasswordReset,
    resetPassword,
    addPassword,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
