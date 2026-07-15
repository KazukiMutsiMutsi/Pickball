// Web stub — this component is not used in the web portal.
// The admin/staff portals render booking data directly with inline styles.
import React from 'react';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
}

interface BookingCardProps {
  booking: Booking;
  onPress?: (booking: Booking) => void;
}

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  return (
    <div
      onClick={() => onPress?.(booking)}
      style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer' }}
    >
      <div style={{ fontWeight: 700 }}>{booking.courtName}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{booking.date} · {booking.startTime} – {booking.endTime}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>${booking.totalPrice.toFixed(2)}</div>
    </div>
  );
}
