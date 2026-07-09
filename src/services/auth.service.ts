// Authentication service
// Replace with your actual auth provider (Supabase, Firebase, custom API, etc.)

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
}

export const authService = {
  async login(_payload: LoginPayload): Promise<AuthUser> {
    throw new Error('authService.login not implemented');
  },

  async register(_payload: RegisterPayload): Promise<AuthUser> {
    throw new Error('authService.register not implemented');
  },

  async logout(): Promise<void> {
    throw new Error('authService.logout not implemented');
  },
};
