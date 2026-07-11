/**
 * bookingStore.ts
 *
 * Single source of truth for all bookings in the app.
 * In production this would call an API. For now it wraps
 * the staff mock data so both the customer and staff sides
 * share the same in-memory list.
 */

import { STAFF_BOOKINGS } from '../staff/data/mock';
import type { StaffBooking } from '../staff/types';

// In-memory store — starts from mock data
let bookings: StaffBooking[] = [...STAFF_BOOKINGS];

/** Return all non-cancelled bookings for a given court + date */
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
 * Check if a requested slot overlaps any existing confirmed booking.
 * Overlap rule: newStart < existingEnd AND newEnd > existingStart
 */
export function hasConflict(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const newStart = toMin(startTime);
  const newEnd   = toMin(endTime);

  return bookings.some(
    (b) =>
      b.id       !== excludeId &&
      b.courtId  === courtId &&
      b.date     === date &&
      b.status   !== 'cancelled' &&
      b.status   !== 'no_show' &&
      newStart    <  toMin(b.endTime) &&
      newEnd      >  toMin(b.startTime),
  );
}

/**
 * Returns the set of start times that are UNAVAILABLE for a given
 * court, date, and chosen duration (whole hours).
 */
export function getUnavailableSlots(
  courtId: string,
  date: string,
  durationHrs: number,
  allStartTimes: string[],
): Set<string> {
  const unavailable = new Set<string>();
  for (const start of allStartTimes) {
    const [h] = start.split(':').map(Number);
    const endH = h + durationHrs;
    const end  = `${String(endH % 24).padStart(2, '0')}:00`;
    if (hasConflict(courtId, date, start, end)) {
      unavailable.add(start);
    }
  }
  return unavailable;
}

/** Add a new booking (called after successful payment) */
export function addBooking(booking: StaffBooking): void {
  bookings = [booking, ...bookings];
}

/** Get all bookings (for staff portal) */
export function getAllBookings(): StaffBooking[] {
  return bookings;
}
