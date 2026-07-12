import type { AdminBooking, AdminCourt, AdminCustomer, AdminStaffMember, AuditEntry } from '../types';

export const TODAY = new Date().toISOString().slice(0, 10);

const d = (day: number) => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const ADMIN_COURTS: AdminCourt[] = [
  { id: 'c1', name: 'Court 1', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 210, active: true  },
  { id: 'c2', name: 'Court 2', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 210, active: true  },
  { id: 'c3', name: 'Court 3', location: 'Pajo, Lapu-Lapu City', type: 'Indoor', pricePerHour: 210, active: true  },
];

export const ADMIN_BOOKINGS: AdminBooking[] = [
  { id: 'BKG-001', playerName: 'Juan dela Cruz',     playerPhone: '+63 917 123 4567', courtId: 'c1', courtName: 'Court 1', date: TODAY,  startTime: '09:00', endTime: '11:00', durationHrs: 2, amount: 420, paid: true,  status: 'checked_in'  },
  { id: 'BKG-002', playerName: 'Maria Santos',       playerPhone: '+63 918 234 5678', courtId: 'c1', courtName: 'Court 1', date: TODAY,  startTime: '10:00', endTime: '12:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-003', playerName: 'Pedro Reyes',        playerPhone: '+63 919 345 6789', courtId: 'c1', courtName: 'Court 1', date: TODAY,  startTime: '13:00', endTime: '15:00', durationHrs: 2, amount: 420, paid: false, status: 'pending'     },
  { id: 'BKG-004', playerName: 'Ana Gonzales',       playerPhone: '+63 912 456 7890', courtId: 'c3', courtName: 'Court 3', date: TODAY,  startTime: '14:00', endTime: '16:00', durationHrs: 2, amount: 420, paid: true,  status: 'reschedule_requested' },
  { id: 'BKG-005', playerName: 'Jose Rizal',         playerPhone: '+63 915 567 8901', courtId: 'c2', courtName: 'Court 2', date: TODAY,  startTime: '09:00', endTime: '10:00', durationHrs: 1, amount: 210, paid: true,  status: 'completed'   },
  { id: 'BKG-006', playerName: 'Andres Bonifacio',   playerPhone: '+63 916 678 9012', courtId: 'c2', courtName: 'Court 2', date: TODAY,  startTime: '13:00', endTime: '15:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-007', playerName: 'Emilio Aguinaldo',   playerPhone: '+63 920 789 0123', courtId: 'c3', courtName: 'Court 3', date: TODAY,  startTime: '17:00', endTime: '19:00', durationHrs: 2, amount: 420, paid: false, status: 'reschedule_requested' },
  { id: 'BKG-008', playerName: 'Gabriela Silang',    playerPhone: '+63 921 890 1234', courtId: 'c1', courtName: 'Court 1', date: TODAY,  startTime: '16:00', endTime: '18:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-009', playerName: 'Apolinario Mabini',  playerPhone: '+63 922 901 2345', courtId: 'c3', courtName: 'Court 3', date: TODAY,  startTime: '15:00', endTime: '17:00', durationHrs: 2, amount: 420, paid: true,  status: 'no_show'     },
  { id: 'BKG-010', playerName: 'Melchora Aquino',    playerPhone: '+63 923 012 3456', courtId: 'c2', courtName: 'Court 2', date: TODAY,  startTime: '18:00', endTime: '19:00', durationHrs: 1, amount: 210, paid: false, status: 'cancelled'   },
  { id: 'BKG-011', playerName: 'Ramon Magsaysay',    playerPhone: '+63 917 111 2222', courtId: 'c1', courtName: 'Court 1', date: d(3),   startTime: '09:00', endTime: '11:00', durationHrs: 2, amount: 420, paid: true,  status: 'completed'   },
  { id: 'BKG-012', playerName: 'Corazon Aquino',     playerPhone: '+63 918 222 3333', courtId: 'c2', courtName: 'Court 2', date: d(3),   startTime: '14:00', endTime: '16:00', durationHrs: 2, amount: 420, paid: true,  status: 'completed'   },
  { id: 'BKG-013', playerName: 'Ferdinand Marcos',   playerPhone: '+63 919 333 4444', courtId: 'c3', courtName: 'Court 3', date: d(5),   startTime: '10:00', endTime: '12:00', durationHrs: 2, amount: 420, paid: true,  status: 'completed'   },
  { id: 'BKG-014', playerName: 'Diego Silang',       playerPhone: '+63 917 888 9999', courtId: 'c1', courtName: 'Court 1', date: d(12),  startTime: '10:00', endTime: '12:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-015', playerName: 'Teresa Magbanua',    playerPhone: '+63 918 999 0000', courtId: 'c2', courtName: 'Court 2', date: d(12),  startTime: '14:00', endTime: '16:00', durationHrs: 2, amount: 420, paid: false, status: 'confirmed'   },
  { id: 'BKG-016', playerName: 'Antonio Luna',       playerPhone: '+63 920 111 2222', courtId: 'c1', courtName: 'Court 1', date: d(14),  startTime: '09:00', endTime: '11:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-017', playerName: 'Melchora Santos',    playerPhone: '+63 921 222 3333', courtId: 'c1', courtName: 'Court 1', date: d(14),  startTime: '16:00', endTime: '18:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-018', playerName: 'Juan Luna',          playerPhone: '+63 922 333 4444', courtId: 'c2', courtName: 'Court 2', date: d(16),  startTime: '10:00', endTime: '12:00', durationHrs: 2, amount: 420, paid: false, status: 'pending'     },
  { id: 'BKG-019', playerName: 'Felix Resurreccion', playerPhone: '+63 923 444 5555', courtId: 'c3', courtName: 'Court 3', date: d(17),  startTime: '14:00', endTime: '16:00', durationHrs: 2, amount: 420, paid: true,  status: 'confirmed'   },
  { id: 'BKG-020', playerName: 'Lorena Barros',      playerPhone: '+63 918 666 7777', courtId: 'c2', courtName: 'Court 2', date: d(21),  startTime: '09:00', endTime: '10:00', durationHrs: 1, amount: 210, paid: true,  status: 'confirmed'   },
];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { id: 'u1', name: 'Juan dela Cruz',     email: 'juan@email.com',     phone: '+63 917 123 4567', joinedDate: '2026-01-15', totalBookings: 8,  totalSpent: 3360, status: 'active'  },
  { id: 'u2', name: 'Maria Santos',       email: 'maria@email.com',    phone: '+63 918 234 5678', joinedDate: '2026-02-20', totalBookings: 5,  totalSpent: 2100, status: 'active'  },
  { id: 'u3', name: 'Pedro Reyes',        email: 'pedro@email.com',    phone: '+63 919 345 6789', joinedDate: '2026-03-05', totalBookings: 3,  totalSpent: 1260, status: 'active'  },
  { id: 'u4', name: 'Ana Gonzales',       email: 'ana@email.com',      phone: '+63 912 456 7890', joinedDate: '2026-01-30', totalBookings: 12, totalSpent: 5040, status: 'active'  },
  { id: 'u5', name: 'Jose Rizal',         email: 'jose@email.com',     phone: '+63 915 567 8901', joinedDate: '2026-04-10', totalBookings: 2,  totalSpent: 420,  status: 'active'  },
  { id: 'u6', name: 'Andres Bonifacio',   email: 'andres@email.com',   phone: '+63 916 678 9012', joinedDate: '2026-02-14', totalBookings: 7,  totalSpent: 2940, status: 'active'  },
  { id: 'u7', name: 'Emilio Aguinaldo',   email: 'emilio@email.com',   phone: '+63 920 789 0123', joinedDate: '2026-05-01', totalBookings: 1,  totalSpent: 210,  status: 'flagged' },
  { id: 'u8', name: 'Gabriela Silang',    email: 'gabriela@email.com', phone: '+63 921 890 1234', joinedDate: '2026-03-22', totalBookings: 4,  totalSpent: 1680, status: 'active'  },
  { id: 'u9', name: 'Apolinario Mabini',  email: 'apolinario@email.com',phone: '+63 922 901 2345',joinedDate: '2026-01-08', totalBookings: 6,  totalSpent: 2520, status: 'banned'  },
  { id:'u10', name: 'Melchora Aquino',    email: 'melchora@email.com', phone: '+63 923 012 3456', joinedDate: '2026-06-01', totalBookings: 1,  totalSpent: 0,    status: 'active'  },
];

export const ADMIN_STAFF: AdminStaffMember[] = [
  { id: 's1', name: 'Alex Reyes',    email: 'staff@picklepro.com',  phone: '+63 917 000 0001', joinedDate: '2026-01-01', lastLogin: TODAY,  status: 'active',    totalActions: 142 },
  { id: 's2', name: 'Bea Santos',    email: 'bea@picklepro.com',    phone: '+63 917 000 0002', joinedDate: '2026-02-15', lastLogin: d(10),  status: 'active',    totalActions: 98  },
  { id: 's3', name: 'Carlo Reyes',   email: 'carlo@picklepro.com',  phone: '+63 917 000 0003', joinedDate: '2026-03-01', lastLogin: d(8),   status: 'suspended', totalActions: 34  },
  { id: 's4', name: 'Diana Cruz',    email: 'diana@picklepro.com',  phone: '+63 917 000 0004', joinedDate: '2026-04-10', lastLogin: d(12),  status: 'active',    totalActions: 77  },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1',  staffName: 'Alex Reyes',  action: 'Approved booking',    target: 'BKG-003 — Pedro Reyes',       timestamp: `${TODAY} 09:15` },
  { id: 'a2',  staffName: 'Alex Reyes',  action: 'Marked On Court',     target: 'BKG-001 — Juan dela Cruz',    timestamp: `${TODAY} 09:05` },
  { id: 'a3',  staffName: 'Bea Santos',  action: 'Declined reschedule', target: 'BKG-004 — Ana Gonzales',      timestamp: `${TODAY} 08:50` },
  { id: 'a4',  staffName: 'Alex Reyes',  action: 'Closed Court 2',      target: 'Court 2 — Maintenance',       timestamp: `${d(10)} 18:00` },
  { id: 'a5',  staffName: 'Diana Cruz',  action: 'Approved booking',    target: 'BKG-018 — Juan Luna',         timestamp: `${d(10)} 14:30` },
  { id: 'a6',  staffName: 'Carlo Reyes', action: 'Marked No Show',      target: 'BKG-009 — Apolinario Mabini', timestamp: `${d(8)} 17:10`  },
  { id: 'a7',  staffName: 'Bea Santos',  action: 'Completed booking',   target: 'BKG-005 — Jose Rizal',        timestamp: `${TODAY} 10:05` },
];
