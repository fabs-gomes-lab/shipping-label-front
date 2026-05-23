import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/api/authService';
import type { User } from '../types/auth';
import type { ApiError } from '../types/api';
import { AxiosError } from 'axios';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token')
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  async function login(email: string, password: string) {
    try {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const apiError = axiosErr.response?.data;
      throw new Error(apiError?.message ?? 'Erro ao fazer login.');
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
