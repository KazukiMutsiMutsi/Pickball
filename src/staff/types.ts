export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'no_show' | 'completed';

export interface StaffBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  courtId: string;
  courtName: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  durationHrs: number;
  companions: number;
  amount: number;
  paid: boolean;
  status: BookingStatus;
}
