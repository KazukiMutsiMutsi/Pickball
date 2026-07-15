import * as SecureStore from 'expo-secure-store';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; }

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   ()                         => Promise<void>;
}

const STORAGE_KEY = 'picklepro_auth_user';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // ── Restore session on app launch ─────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          setUser(parsed);
        }
      } catch {
        // corrupt storage — ignore
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ── Persist user to secure store ──────────────────────────────────────────
  const persistUser = useCallback(async (u: AuthUser | null) => {
    if (u) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(u));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
    setUser(u);
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const login = useCallback(async (payload: LoginPayload) => {
    const role: UserRole = payload.email.toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const u: AuthUser = {
      id:    '1',
      name:  role === 'admin' ? 'Admin User' : 'Juan dela Cruz',
      email: payload.email,
      token: 'mock-token',
      role,
    };
    await persistUser(u);
  }, [persistUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const u: AuthUser = {
      id:    '2',
      name:  payload.name,
      email: payload.email,
      token: 'mock-token',
      role:  'user',
    };
    await persistUser(u);
  }, [persistUser]);

  const logout = useCallback(async () => {
    await persistUser(null);
  }, [persistUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    isLoading,
    login,
    register,
    logout,
  }), [user, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
