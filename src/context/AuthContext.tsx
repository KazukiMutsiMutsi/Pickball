import { createClient } from '@supabase/supabase-js';
import { deleteItemAsync, getItemAsync, isAvailableAsync, setItemAsync } from 'expo-secure-store';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

// ── Supabase client ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Secure storage helpers ────────────────────────────────────────────────────
const memoryStore: Record<string, string> = {};

async function storeSet(key: string, value: string) {
  try {
    if (await isAvailableAsync()) { await setItemAsync(key, value); return; }
  } catch { /* fall through */ }
  memoryStore[key] = value;
}

async function storeGet(key: string): Promise<string | null> {
  try {
    if (await isAvailableAsync()) return await getItemAsync(key);
  } catch { /* fall through */ }
  return memoryStore[key] ?? null;
}

async function storeDel(key: string) {
  try {
    if (await isAvailableAsync()) { await deleteItemAsync(key); return; }
  } catch { /* fall through */ }
  delete memoryStore[key];
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;        // Supabase JWT access token
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
  loginWithGoogle: ()                  => Promise<void>;
  logout:   ()                         => Promise<void>;
}

const STORAGE_KEY = 'picklepro_auth_user';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session from secure store ─────────────────────────────────────
  useEffect(() => {
    async function restore() {
      try {
        const stored = await storeGet(STORAGE_KEY);
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          // Validate the stored token is still alive
          const { data: { user: sbUser }, error } = await supabase.auth.getUser(parsed.token);
          if (!error && sbUser) {
            setUser(parsed);
          } else {
            await storeDel(STORAGE_KEY);
          }
        }
      } catch { /* corrupt storage */ }
      finally { setIsLoading(false); }
    }
    restore();
  }, []);

  const persistUser = useCallback(async (u: AuthUser | null) => {
    if (u) await storeSet(STORAGE_KEY, JSON.stringify(u));
    else   await storeDel(STORAGE_KEY);
    setUser(u);
  }, []);

  // ── Build AuthUser from Supabase session ──────────────────────────────────
  function buildAuthUser(sbUser: { id: string; email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }, token: string): AuthUser {
    const role = ((sbUser.app_metadata?.['role'] ?? sbUser.user_metadata?.['role']) as string | undefined) === 'admin'
      ? 'admin'
      : 'user';
    const name = (sbUser.user_metadata?.['full_name'] ?? sbUser.user_metadata?.['name'] ?? sbUser.email?.split('@')[0] ?? 'User') as string;
    const avatar = sbUser.user_metadata?.['avatar_url'] as string | undefined;
    return { id: sbUser.id, name, email: sbUser.email ?? '', token, role, avatar };
  }

  // ── Login with email + password ───────────────────────────────────────────
  const login = useCallback(async ({ email, password }: LoginPayload) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message ?? 'Login failed.');
    await persistUser(buildAuthUser(data.user, data.session.access_token));
  }, [persistUser]);

  // ── Register with email + password ────────────────────────────────────────
  const register = useCallback(async ({ name, email, phone, password }: RegisterPayload) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Check your email to confirm your account.');
    await persistUser(buildAuthUser(data.user!, data.session.access_token));
  }, [persistUser]);

  // ── Login with Google OAuth ───────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'picklepro://auth/callback' },
    });
    if (error) throw new Error(error.message);
    // Session will be picked up via deep-link / onAuthStateChange in your app _layout
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    await persistUser(null);
  }, [persistUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
  }), [user, isLoading, login, register, loginWithGoogle, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
