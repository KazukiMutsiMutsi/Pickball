import type { StaffBooking } from '../types';

/**
 * Returns the first confirmed/checked_in booking that overlaps
 * with the given booking on the same court and date.
 * Returns null if no conflict.
 *
 * Overlap rule: newStart < existingEnd AND newEnd > existingStart
 */
export function findConflict(
  booking: StaffBooking,
  allBookings: StaffBooking[],
): StaffBooking | null {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const newStart = toMin(booking.startTime);
  const newEnd   = toMin(booking.endTime);

  return (
    allBookings.find((b) =>
      b.id      !== booking.id &&
      b.courtId === booking.courtId &&
      b.date    === booking.date &&
      (b.status === 'confirmed' || b.status === 'checked_in') &&
      newStart < toMin(b.endTime) &&
      newEnd   > toMin(b.startTime),
    ) ?? null
  );
}

/**
 * Returns courts that are FREE at the given date/time
 * (excluding the booking being resolved itself).
 */
export function freeCourtsAt(
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId: string,
  allBookings: StaffBooking[],
  allCourtIds: string[],
): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const newStart = toMin(startTime);
  const newEnd   = toMin(endTime);

  const takenCourtIds = new Set(
    allBookings
      .filter((b) =>
        b.id      !== excludeBookingId &&
        b.date    === date &&
        (b.status === 'confirmed' || b.status === 'checked_in') &&
        newStart < toMin(b.endTime) &&
        newEnd   > toMin(b.startTime),
      )
      .map((b) => b.courtId),
  );

  return allCourtIds.filter((id) => !takenCourtIds.has(id));
}
