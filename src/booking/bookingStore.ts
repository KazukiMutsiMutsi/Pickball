// Single source of truth for all bookings (mobile app only)

export interface StaffBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHrs: number;
  companions: number;
  players: number;
  amount: number;
  serviceFee: number;
  subtotal: number;
  paymentMethod: string;
  paid: boolean;
  status: 'confirmed' | 'pending' | 'cancelled' | 'no_show' | 'checked_in' | 'completed';
}

export interface StaffCourt {
  id: string;
  name: string;
  pricePerHour: number;
  status: 'open' | 'closed' | 'maintenance';
}

// ── Seed courts only ─────────────────────────────────────────────────────────

const SEED_COURTS: StaffCourt[] = [
  { id: '1', name: 'Court 1', pricePerHour: 500, status: 'open' },
  { id: '2', name: 'Court 2', pricePerHour: 500, status: 'open' },
  { id: '3', name: 'Court 3', pricePerHour: 500, status: 'open' },
];

// ── Pending holds (soft lock while user is paying) ───────────────────────────

export interface PendingHold {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  expiresAt: number;
}

/** How long a pending hold lasts before the slot frees again */
export const HOLD_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ── In-memory stores ──────────────────────────────────────────────────────────

let bookings: StaffBooking[] = [];
let holds:    PendingHold[]  = [];
let courts:   StaffCourt[]   = [...SEED_COURTS];
/** Hold created by the current booking flow (so we can free it on back) */
let sessionHoldId: string | null = null;

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return (h === 0 ? 24 : h) * 60 + m;
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toMin(aStart) < toMin(bEnd) && toMin(aEnd) > toMin(bStart);
}

export function purgeExpiredHolds(): void {
  const now = Date.now();
  holds = holds.filter(h => h.expiresAt > now);
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function getAllBookings(): StaffBooking[] {
  return bookings;
}

export function getBookingsForSlot(courtId: string, date: string): StaffBooking[] {
  return bookings.filter(
    b => b.courtId === courtId && b.date === date &&
         b.status !== 'cancelled' && b.status !== 'no_show',
  );
}

export function addBooking(booking: StaffBooking): void {
  bookings = [booking, ...bookings];
}

export function updateBooking(id: string, changes: Partial<StaffBooking>): void {
  bookings = bookings.map(b => b.id === id ? { ...b, ...changes } : b);
}

export function deleteBooking(id: string): void {
  bookings = bookings.filter(b => b.id !== id);
}

// ── Pending holds ─────────────────────────────────────────────────────────────

export function getPendingHoldsForSlot(courtId: string, date: string): PendingHold[] {
  purgeExpiredHolds();
  return holds.filter(h => h.courtId === courtId && h.date === date);
}

export function getHoldById(id: string): PendingHold | undefined {
  purgeExpiredHolds();
  return holds.find(h => h.id === id);
}

/**
 * Soft-lock a slot while the user completes payment.
 * Returns null if the slot conflicts with a booking or another hold.
 */
export function createPendingHold(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  replaceHoldId?: string,
): PendingHold | null {
  purgeExpiredHolds();
  if (replaceHoldId) {
    holds = holds.filter(h => h.id !== replaceHoldId);
  }
  if (hasConflict(courtId, date, startTime, endTime)) {
    return null;
  }
  const hold: PendingHold = {
    id: `HOLD-${Date.now().toString(36).toUpperCase()}`,
    courtId,
    date,
    startTime,
    endTime,
    expiresAt: Date.now() + HOLD_TTL_MS,
  };
  holds = [hold, ...holds];
  sessionHoldId = hold.id;
  return hold;
}

export function releasePendingHold(id?: string): void {
  if (!id) return;
  holds = holds.filter(h => h.id !== id);
  if (sessionHoldId === id) sessionHoldId = null;
}

/** Free the slot if the user goes back to pick a different time */
export function releaseSessionHold(): void {
  if (sessionHoldId) releasePendingHold(sessionHoldId);
}

export function getSessionHoldId(): string | null {
  return sessionHoldId;
}

/** Hour keys (e.g. '07') covered by a booking/hold range — for calendar cells */
export function hourKeysInRange(startTime: string, endTime: string): string[] {
  const keys: string[] = [];
  for (let m = toMin(startTime); m < toMin(endTime); m += 60) {
    const hour = Math.floor(m / 60);
    keys.push(String(hour === 24 ? 0 : hour).padStart(2, '0'));
  }
  return keys;
}

// ── Conflict detection ────────────────────────────────────────────────────────

export function hasConflict(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
  excludeHoldId?: string,
): boolean {
  purgeExpiredHolds();
  const booked = bookings.some(b =>
    b.id !== excludeBookingId && b.courtId === courtId && b.date === date &&
    b.status !== 'cancelled' && b.status !== 'no_show' &&
    rangesOverlap(startTime, endTime, b.startTime, b.endTime),
  );
  if (booked) return true;
  return holds.some(h =>
    h.id !== excludeHoldId && h.courtId === courtId && h.date === date &&
    rangesOverlap(startTime, endTime, h.startTime, h.endTime),
  );
}

export function getUnavailableSlots(
  courtId: string,
  date: string,
  durationHrs: number,
  allStartTimes: string[],
): Set<string> {
  const unavailable = new Set<string>();
  for (const start of allStartTimes) {
    const [h] = start.split(':').map(Number);
    const end = `${String((h + durationHrs) % 24).padStart(2, '0')}:00`;
    if (hasConflict(courtId, date, start, end)) unavailable.add(start);
  }
  return unavailable;
}

// ── Courts ────────────────────────────────────────────────────────────────────

export function getAllCourts(): StaffCourt[] {
  return courts;
}

export function updateCourt(id: string, changes: Partial<StaffCourt>): void {
  courts = courts.map(c => c.id === id ? { ...c, ...changes } : c);
}
