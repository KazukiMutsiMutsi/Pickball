export type AdminPage =
  | 'dashboard'
  | 'bookings'
  | 'courts'
  | 'users'
  | 'staff'
  | 'reports'
  | 'settings';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export type BookingStatus =
  | 'confirmed'
  | 'pending'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'reschedule_requested';

export interface AdminBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHrs: number;
  amount: number;
  paid: boolean;
  status: BookingStatus;
}

export interface AdminCourt {
  id: string;
  name: string;
  location: string;
  type: 'Indoor' | 'Outdoor' | 'Covered';
  pricePerHour: number;
  active: boolean;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'banned' | 'flagged';
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  totalActions: number;
}

export interface AuditEntry {
  id: string;
  staffName: string;
  action: string;
  target: string;
  timestamp: string;
}
