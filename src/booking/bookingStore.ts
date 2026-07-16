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

// ── In-memory stores ──────────────────────────────────────────────────────────

let bookings: StaffBooking[] = [];
let courts:   StaffCourt[]   = [...SEED_COURTS];

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

// ── Conflict detection ────────────────────────────────────────────────────────

export function hasConflict(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string,
): boolean {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const newStart = toMin(startTime);
  const newEnd   = toMin(endTime);
  return bookings.some(b =>
    b.id !== excludeId && b.courtId === courtId && b.date === date &&
    b.status !== 'cancelled' && b.status !== 'no_show' &&
    newStart < toMin(b.endTime) && newEnd > toMin(b.startTime),
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
