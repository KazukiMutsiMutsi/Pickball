import type { StaffBooking } from '../staff/types';

// In-memory store — persists for the lifetime of the JS context.
// Replace with AsyncStorage / backend calls for production.
let bookings: StaffBooking[] = [];

/** Add a new booking to the store. */
export function addBooking(booking: StaffBooking): void {
  bookings = [...bookings, booking];
}

/** Update an existing booking by id. */
export function updateBooking(id: string, updates: Partial<StaffBooking>): void {
  bookings = bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
}

/** Remove a booking from the store. */
export function removeBooking(id: string): void {
  bookings = bookings.filter((b) => b.id !== id);
}

/** Return all bookings. */
export function getAllBookings(): StaffBooking[] {
  return bookings;
}

/**
 * Return all non-cancelled bookings for a given court + date,
 * used to render booked slots in the time picker.
 */
export function getBookingsForSlot(courtId: string, date: string): StaffBooking[] {
  return bookings.filter(
    (b) =>
      b.courtId === courtId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.status !== 'no_show',
  );
}

/**
 * Check whether a new booking overlaps with any existing booking
 * for the same court on the same day.
 */
export function hasConflict(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
): boolean {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const newStart = toMins(startTime);
  const newEnd = toMins(endTime);

  return getBookingsForSlot(courtId, date).some((b) => {
    const bStart = toMins(b.startTime);
    const bEnd = toMins(b.endTime);
    return newStart < bEnd && newEnd > bStart;
  });
}
