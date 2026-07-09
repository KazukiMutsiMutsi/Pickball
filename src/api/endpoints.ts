// Centralised API endpoint definitions

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  courts: {
    list: '/courts',
    detail: (id: string) => `/courts/${id}`,
  },
  bookings: {
    list: '/bookings',
    create: '/bookings',
    cancel: (id: string) => `/bookings/${id}/cancel`,
  },
  payments: {
    create: '/payments',
    detail: (id: string) => `/payments/${id}`,
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
  },
  profile: {
    get: '/profile',
    update: '/profile',
  },
} as const;
