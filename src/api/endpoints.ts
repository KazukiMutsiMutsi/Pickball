// Centralised API endpoint definitions — matches pickleball-backend routes

export const ENDPOINTS = {
  courts: {
    list:         '/api/courts',
    availability: '/api/courts/availability',         // ?date=YYYY-MM-DD
    courtAvail:   (id: string) => `/api/courts/${id}/availability`, // ?date=
    gcash:        '/api/gcash',
  },
  bookings: {
    create:    '/api/bookings',
    mine:      '/api/bookings/me',
    detail:    (id: string) => `/api/bookings/${id}`,
    qr:        (id: string) => `/api/bookings/${id}/qr`,
    pay:       (id: string) => `/api/bookings/${id}/pay`,
    cancel:    (id: string) => `/api/bookings/${id}/cancel`,
  },
  notifications: {
    list:     '/api/notifications',
    markRead: (id: string) => `/api/notifications/${id}/read`,
    readAll:  '/api/notifications/read-all',
  },
} as const;
