import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types/user';
import * as authService from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Seed test user & mock data on first run
        await authService.seedTestUser();

        const restored = await authService.restoreSession();
        if (restored) {
          setUser(restored);
          setToken('restored');
        }
      } catch {
        // Session restore failed — user stays logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const loggedInUser = await authService.loginWithEmail(credentials);
      setUser(loggedInUser);
      setToken('authenticated');
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setIsLoading(true);
    try {
      const newUser = await authService.registerWithEmail(data);
      setUser(newUser);
      setToken('authenticated');
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
