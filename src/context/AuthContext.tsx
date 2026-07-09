import React, { createContext, ReactNode, useState } from 'react';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload   { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; }

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   ()                         => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (payload: LoginPayload) => {
    // ── Mock auth — swap for real API ─────────────────────────────────────
    // Any email starting with "admin" logs in as admin, all others as user.
    const role: UserRole = payload.email.toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const mockUser: AuthUser = {
      id:    '1',
      name:  role === 'admin' ? 'Admin User' : 'Juan dela Cruz',
      email: payload.email,
      token: 'mock-token',
      role,
    };
    setUser(mockUser);
  };

  const register = async (payload: RegisterPayload) => {
    const mockUser: AuthUser = {
      id:    '2',
      name:  payload.name,
      email: payload.email,
      token: 'mock-token',
      role:  'user',
    };
    setUser(mockUser);
  };

  const logout = async () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, role: user?.role ?? null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
