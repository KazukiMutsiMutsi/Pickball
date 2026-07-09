import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Booking Confirmed', message: 'Your court is booked for July 12.', timestamp: '2026-07-09T10:00:00Z', read: false },
  { id: '2', title: 'Reminder', message: 'Your session starts in 1 hour.', timestamp: '2026-07-09T08:00:00Z', read: true },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.read && styles.unread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  heading: { fontSize: 24, fontWeight: '800', color: '#212121', padding: 16 },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
  },
  unread: { borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  title: { fontSize: 15, fontWeight: '600', color: '#212121' },
  message: { fontSize: 13, color: '#757575', marginTop: 4 },
});
