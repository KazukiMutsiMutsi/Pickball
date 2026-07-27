import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  court_id: string;
  date: string;
  start_slot: string;
  end_slot: string;
  duration_hours: number;
  players: number;
  hourly_rate: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  qr_code?: string;
  payment_note?: string;
  created_at: string;
  courts?: { name: string; display_name: string; location: string };
}

export interface CreateBookingPayload {
  courtId: string;
  date: string;
  startSlot: string;
  endSlot: string;
  players: number;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
  gcash: { phone_number: string; account_name: string };
}

export interface QRTicketResponse {
  bookingRef: string;
  qrCode: string; // base64 data URL
}

export const bookingsService = {
  /** Create a new booking (returns pending + gcash details) */
  async create(payload: CreateBookingPayload, token: string): Promise<CreateBookingResponse> {
    return apiRequest<CreateBookingResponse>(ENDPOINTS.bookings.create, {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    });
  },

  /** Get all bookings for the logged-in user */
  async getAll(token: string): Promise<Booking[]> {
    const data = await apiRequest<{ bookings: Booking[] }>(ENDPOINTS.bookings.mine, { token });
    return data.bookings;
  },

  /** Get a single booking by ID */
  async getById(id: string, token: string): Promise<Booking> {
    const data = await apiRequest<{ booking: Booking }>(ENDPOINTS.bookings.detail(id), { token });
    return data.booking;
  },

  /** Get QR check-in ticket (only for confirmed bookings) */
  async getQRTicket(id: string, token: string): Promise<QRTicketResponse> {
    return apiRequest<QRTicketResponse>(ENDPOINTS.bookings.qr(id), { token });
  },

  /** Submit GCash payment reference */
  async submitPayment(id: string, paymentNote: string, token: string): Promise<Booking> {
    const data = await apiRequest<{ booking: Booking }>(ENDPOINTS.bookings.pay(id), {
      method: 'POST',
      body: JSON.stringify({ paymentNote }),
      token,
    });
    return data.booking;
  },

  /** Cancel a booking */
  async cancel(id: string, token: string): Promise<Booking> {
    const data = await apiRequest<{ booking: Booking }>(ENDPOINTS.bookings.cancel(id), {
      method: 'PATCH',
      token,
    });
    return data.booking;
  },
};
