// ─── Staff Portal — shared types ─────────────────────────────────────────────

export type BookingStatus =
  | 'confirmed'
  | 'pending'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'reschedule_requested'; // Customer asked to change their booking time/court

export type CourtType = 'Indoor' | 'Outdoor' | 'Covered';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'staff';
}

export interface StaffCourt {
  id: string;
  name: string;
  location: string;
  type: CourtType;
  pricePerHour: number;
  totalSlots: number;
  active: boolean;
}

export interface StaffBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  courtId: string;
  courtName: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM (24h)
  endTime: string;     // HH:MM (24h)
  durationHrs: number;
  companions: number;  // additional people with the booker (0 = solo)
  amount: number;
  paid: boolean;
  status: BookingStatus;
  rescheduleNote?: string; // Customer's reason when status === 'reschedule_requested'
}

export type StaffPage = 'dashboard' | 'schedule' | 'courts' | 'checkin' | 'players';
