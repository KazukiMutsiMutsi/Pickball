import BookingCard, { Booking } from '@/src/components/BookingCard';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    courtName: 'Downtown Pickleball Center',
    date: '2026-07-05',
    startTime: '09:00',
    endTime: '11:00',
    status: 'completed',
    totalPrice: 40,
  },
  {
    id: '2',
    courtName: 'Riverside Courts',
    date: '2026-07-12',
    startTime: '14:00',
    endTime: '15:00',
    status: 'upcoming',
    totalPrice: 15,
  },
];

export default function BookingHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>
      <FlatList
        data={MOCK_BOOKINGS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  heading: { fontSize: 24, fontWeight: '800', color: '#212121', padding: 16 },
  list: { paddingBottom: 24 },
});
