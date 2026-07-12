import React, { createContext, useContext, useState } from 'react';
import type { AdminUser } from '../types';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Static credentials
const ADMIN_CREDENTIALS = { email: 'admin@picklepro.com', password: 'admin123' };
const ADMIN_USER: AdminUser = { id: 'adm-1', name: 'Admin', email: 'admin@picklepro.com', role: 'admin' };

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser(ADMIN_USER);
      return null;
    }
    return 'Invalid email or password.';
  };

  const logout = () => setUser(null);

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
