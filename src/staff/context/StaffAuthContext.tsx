import React, { createContext, useContext, useState } from 'react';
import type { StaffUser } from '../types';

interface StaffAuthCtx {
  user: StaffUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthCtx | null>(null);

// Static mock — swap with real API call when backend is ready
const MOCK_STAFF: StaffUser = {
  id: 'staff-001',
  name: 'Alex Reyes',
  email: 'staff@picklepro.com',
  role: 'staff',
};

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);

  const login = async (email: string, password: string) => {
    if (email === 'staff@picklepro.com' && password === 'staff123') {
      setUser(MOCK_STAFF);
    } else {
      throw new Error('Invalid staff credentials.');
    }
  };

  const logout = () => setUser(null);

  return (
    <StaffAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffAuth must be used inside <StaffAuthProvider>');
  return ctx;
}
