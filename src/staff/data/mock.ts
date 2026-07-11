// Static mock data — all hardcoded, no API calls
import type { StaffBooking, StaffCourt } from '../types';

export const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Helper — build a date string for the current month
const d = (day: number) => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const STAFF_COURTS: StaffCourt[] = [
  { id: 'c1', name: 'Court 1', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 20, totalSlots: 6, active: true },
  { id: 'c2', name: 'Court 2', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 15, totalSlots: 3, active: true },
  { id: 'c3', name: 'Court 3', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 18, totalSlots: 8, active: true },
];

export const STAFF_BOOKINGS: StaffBooking[] = [
  // ── Today ──────────────────────────────────────────────────────────────────
  { id: 'BKG-001', playerName: 'Juan dela Cruz',    playerPhone: '+63 917 123 4567', courtId: 'c1', courtName: 'Court 1', date: TODAY, startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 3, amount: 420,  paid: true,  status: 'checked_in' },
  { id: 'BKG-002', playerName: 'Maria Santos',      playerPhone: '+63 918 234 5678', courtId: 'c1', courtName: 'Court 1', date: TODAY, startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 1, amount: 315,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-003', playerName: 'Pedro Reyes',       playerPhone: '+63 919 345 6789', courtId: 'c1', courtName: 'Court 1', date: TODAY, startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 2, amount: 378,  paid: false, status: 'pending'    },
  { id: 'BKG-004', playerName: 'Ana Gonzales',      playerPhone: '+63 912 456 7890', courtId: 'c3', courtName: 'Court 3', date: TODAY, startTime: '14:00', endTime: '16:00', durationHrs: 2,   companions: 0, amount: 462,  paid: true,  status: 'reschedule_requested', rescheduleNote: 'Can we move to 4:00 PM – 6:00 PM? Meeting ran late.' },
  { id: 'BKG-005', playerName: 'Jose Rizal',        playerPhone: '+63 915 567 8901', courtId: 'c2', courtName: 'Court 2', date: TODAY, startTime: '09:00', endTime: '10:00', durationHrs: 1,   companions: 1, amount: 126,  paid: true,  status: 'completed'  },
  { id: 'BKG-006', playerName: 'Andres Bonifacio',  playerPhone: '+63 916 678 9012', courtId: 'c2', courtName: 'Court 2', date: TODAY, startTime: '13:00', endTime: '15:00', durationHrs: 2,   companions: 4, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-007', playerName: 'Emilio Aguinaldo',  playerPhone: '+63 920 789 0123', courtId: 'c3', courtName: 'Court 3', date: TODAY, startTime: '17:00', endTime: '19:00', durationHrs: 2,   companions: 2, amount: 378,  paid: false, status: 'reschedule_requested', rescheduleNote: 'Please switch court to Court 2 if available, same time.' },
  { id: 'BKG-008', playerName: 'Gabriela Silang',   playerPhone: '+63 921 890 1234', courtId: 'c1', courtName: 'Court 1', date: TODAY, startTime: '16:00', endTime: '18:00', durationHrs: 2,   companions: 3, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-009', playerName: 'Apolinario Mabini', playerPhone: '+63 922 901 2345', courtId: 'c3', courtName: 'Court 3', date: TODAY, startTime: '15:00', endTime: '17:00', durationHrs: 2,   companions: 1, amount: 252,  paid: true,  status: 'no_show'    },
  { id: 'BKG-010', playerName: 'Melchora Aquino',   playerPhone: '+63 923 012 3456', courtId: 'c2', courtName: 'Court 2', date: TODAY, startTime: '18:00', endTime: '19:00', durationHrs: 1,   companions: 0, amount: 189,  paid: false, status: 'cancelled'  },

  // ── Other days this month ──────────────────────────────────────────────────
  { id: 'BKG-011', playerName: 'Ramon Magsaysay',   playerPhone: '+63 917 111 2222', courtId: 'c1', courtName: 'Court 1', date: d(3),  startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 2, amount: 420,  paid: true,  status: 'completed'  },
  { id: 'BKG-012', playerName: 'Corazon Aquino',    playerPhone: '+63 918 222 3333', courtId: 'c2', courtName: 'Court 2', date: d(3),  startTime: '14:00', endTime: '16:00', durationHrs: 2,   companions: 1, amount: 378,  paid: true,  status: 'completed'  },
  { id: 'BKG-013', playerName: 'Ferdinand Marcos',  playerPhone: '+63 919 333 4444', courtId: 'c3', courtName: 'Court 3', date: d(5),  startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 3, amount: 462,  paid: true,  status: 'completed'  },
  { id: 'BKG-014', playerName: 'Imelda Marcos',     playerPhone: '+63 920 444 5555', courtId: 'c1', courtName: 'Court 1', date: d(5),  startTime: '15:00', endTime: '17:00', durationHrs: 2,   companions: 0, amount: 420,  paid: false, status: 'completed'  },
  { id: 'BKG-015', playerName: 'Ninoy Aquino',      playerPhone: '+63 921 555 6666', courtId: 'c1', courtName: 'Court 1', date: d(7),  startTime: '09:00', endTime: '10:00', durationHrs: 1,   companions: 1, amount: 126,  paid: true,  status: 'completed'  },
  { id: 'BKG-016', playerName: 'Cory Santos',       playerPhone: '+63 922 666 7777', courtId: 'c2', courtName: 'Court 2', date: d(7),  startTime: '13:00', endTime: '15:00', durationHrs: 2,   companions: 2, amount: 378,  paid: true,  status: 'completed'  },
  { id: 'BKG-017', playerName: 'Lapu-Lapu',         playerPhone: '+63 923 777 8888', courtId: 'c3', courtName: 'Court 3', date: d(8),  startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 4, amount: 462,  paid: true,  status: 'completed'  },
  { id: 'BKG-018', playerName: 'Diego Silang',      playerPhone: '+63 917 888 9999', courtId: 'c1', courtName: 'Court 1', date: d(12), startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 1, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-019', playerName: 'Teresa Magbanua',   playerPhone: '+63 918 999 0000', courtId: 'c2', courtName: 'Court 2', date: d(12), startTime: '14:00', endTime: '16:00', durationHrs: 2,   companions: 0, amount: 315,  paid: false, status: 'confirmed'  },
  { id: 'BKG-020', playerName: 'Gregorio del Pilar',playerPhone: '+63 919 000 1111', courtId: 'c3', courtName: 'Court 3', date: d(13), startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 3, amount: 462,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-021', playerName: 'Antonio Luna',      playerPhone: '+63 920 111 2222', courtId: 'c1', courtName: 'Court 1', date: d(14), startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 2, amount: 252,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-022', playerName: 'Melchora Santos',   playerPhone: '+63 921 222 3333', courtId: 'c1', courtName: 'Court 1', date: d(14), startTime: '16:00', endTime: '18:00', durationHrs: 2,   companions: 1, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-023', playerName: 'Juan Luna',         playerPhone: '+63 922 333 4444', courtId: 'c2', courtName: 'Court 2', date: d(16), startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 0, amount: 378,  paid: false, status: 'confirmed'  },
  { id: 'BKG-024', playerName: 'Felix Resurreccion',playerPhone: '+63 923 444 5555', courtId: 'c3', courtName: 'Court 3', date: d(17), startTime: '14:00', endTime: '16:00', durationHrs: 2,   companions: 2, amount: 462,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-025', playerName: 'Magdalena Jalandoni',playerPhone: '+63 917 555 6666',courtId: 'c1', courtName: 'Court 1', date: d(19), startTime: '09:00', endTime: '11:00', durationHrs: 2,   companions: 3, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-026', playerName: 'Lorena Barros',     playerPhone: '+63 918 666 7777', courtId: 'c2', courtName: 'Court 2', date: d(21), startTime: '09:00', endTime: '10:00', durationHrs: 1,   companions: 1, amount: 126,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-027', playerName: 'Salud Algabre',     playerPhone: '+63 919 777 8888', courtId: 'c2', courtName: 'Court 2', date: d(21), startTime: '15:00', endTime: '17:00', durationHrs: 2,   companions: 0, amount: 378,  paid: false, status: 'confirmed'  },
  { id: 'BKG-028', playerName: 'Trinidad Tecson',   playerPhone: '+63 920 888 9999', courtId: 'c3', courtName: 'Court 3', date: d(23), startTime: '10:00', endTime: '12:00', durationHrs: 2,   companions: 2, amount: 462,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-029', playerName: 'Melchora Aquino',   playerPhone: '+63 921 999 0000', courtId: 'c1', courtName: 'Court 1', date: d(25), startTime: '14:00', endTime: '16:00', durationHrs: 2,   companions: 1, amount: 420,  paid: true,  status: 'confirmed'  },
  { id: 'BKG-030', playerName: 'Josefa Llanes',     playerPhone: '+63 922 000 1111', courtId: 'c2', courtName: 'Court 2', date: d(28), startTime: '09:00', endTime: '10:00', durationHrs: 1,   companions: 0, amount: 189,  paid: true,  status: 'confirmed'  },
];
