import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; target_role?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('meresumax_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('meresumax_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('meresumax_token')) {
        const { user: fetchedUser } = await api.getMe();
        setUser(fetchedUser);
        localStorage.setItem('meresumax_user', JSON.stringify(fetchedUser));
      } else {
        setUser(null);
        localStorage.removeItem('meresumax_user');
      }
    } catch (err: any) {
      console.warn('Session verification notice:', err);
      // Only clear credentials if the server explicitly confirmed token invalidity (401/expired).
      // Never wipe credentials during transient network hiccups or Render cold starts.
      if (err?.message && (err.message.includes('expired') || err.message.includes('log in again') || err.message.includes('401'))) {
        localStorage.removeItem('meresumax_token');
        localStorage.removeItem('meresumax_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await api.login(data);
    localStorage.setItem('meresumax_token', res.token);
    localStorage.setItem('meresumax_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; target_role?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('meresumax_token', res.token);
    localStorage.setItem('meresumax_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('meresumax_token');
    localStorage.removeItem('meresumax_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
