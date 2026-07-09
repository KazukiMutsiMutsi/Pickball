import { shadowMd } from '@/src/utils/shadow';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const STATUS_COLORS: Record<BookingStatus, string> = {
  upcoming: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336',
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(booking)}>
      <View style={styles.header}>
        <Text style={styles.courtName}>{booking.courtName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] }]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      <Text style={styles.dateTime}>
        {booking.date} · {booking.startTime} – {booking.endTime}
      </Text>
      <Text style={styles.price}>${booking.totalPrice.toFixed(2)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...shadowMd,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courtName: { fontSize: 16, fontWeight: '600', color: '#212121' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  dateTime: { fontSize: 13, color: '#757575', marginTop: 8 },
  price: { fontSize: 15, fontWeight: '700', color: '#212121', marginTop: 6 },
});
