/**
 * bookingStore.ts — Single source of truth for all bookings.
 *
 * All three portals (Customer, Staff, Admin) read and write through
 * this module. In production this would be replaced by API calls.
 *
 * Shared data flow:
 *   Customer books  → addBooking()      → visible in Staff + Admin
 *   Staff approves  → updateBooking()   → visible in Admin
 *   Admin cancels   → updateBooking()   → visible in Staff + Customer history
 */

import { STAFF_BOOKINGS, STAFF_COURTS } from '../staff/data/mock';
import type { StaffBooking, StaffCourt } from '../staff/types';

// ── In-memory stores ──────────────────────────────────────────────────────────
let bookings: StaffBooking[] = [...STAFF_BOOKINGS];
let courts:   StaffCourt[]   = [...STAFF_COURTS];

// ── Bookings ──────────────────────────────────────────────────────────────────

/** Get all bookings */
export function getAllBookings(): StaffBooking[] {
  return bookings;
}

/** Get bookings for a specific court + date */
export function getBookingsForSlot(courtId: string, date: string): StaffBooking[] {
  return bookings.filter(
    (b) =>
      b.courtId === courtId &&
      b.date    === date    &&
      b.status  !== 'cancelled' &&
      b.status  !== 'no_show',
  );
}

/** Add a new booking (customer checkout) */
export function addBooking(booking: StaffBooking): void {
  bookings = [booking, ...bookings];
}

/** Update a booking's fields (staff/admin actions) */
export function updateBooking(id: string, changes: Partial<StaffBooking>): void {
  bookings = bookings.map((b) => (b.id === id ? { ...b, ...changes } : b));
}

/** Remove a booking by ID (admin hard-delete) */
export function deleteBooking(id: string): void {
  bookings = bookings.filter((b) => b.id !== id);
}

// ── Conflict detection ────────────────────────────────────────────────────────

/**
 * Returns true if the requested slot overlaps an existing active booking.
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
      b.id      !== excludeId &&
      b.courtId === courtId  &&
      b.date    === date     &&
      b.status  !== 'cancelled' &&
      b.status  !== 'no_show'   &&
      newStart   <  toMin(b.endTime) &&
      newEnd     >  toMin(b.startTime),
  );
}

/**
 * Returns the set of start times unavailable for a given court/date/duration.
 * Used to grey out slots on the customer time picker.
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

// ── Courts ────────────────────────────────────────────────────────────────────

/** Get all courts */
export function getAllCourts(): StaffCourt[] {
  return courts;
}

/** Update a court's fields (admin edit / staff close) */
export function updateCourt(id: string, changes: Partial<StaffCourt>): void {
  courts = courts.map((c) => (c.id === id ? { ...c, ...changes } : c));
}
