import { Palette, Spacing } from '@/constants/theme';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllBookings, updateBooking } from '@/src/booking/bookingStore';

/**
 * Minimal admin portal (web only).
 * Shows all bookings and allows status changes.
 */
export default function AdminApp() {
  const [, forceUpdate] = useState(0);
  const bookings = getAllBookings();

  const setStatus = (id: string, status: 'confirmed' | 'cancelled') => {
    updateBooking(id, { status });
    forceUpdate((n) => n + 1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏓 PicklePro Admin</Text>
      <Text style={styles.subtitle}>All Bookings ({bookings.length})</Text>

      {bookings.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No bookings yet.</Text>
        </View>
      )}

      {bookings.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.cardId}>{b.id}</Text>
          <Text style={styles.cardInfo}>{b.courtName} · {b.date} · {b.startTime}–{b.endTime}</Text>
          <Text style={styles.cardPlayer}>{b.playerName || 'Customer'}</Text>
          <Text style={[styles.cardStatus, b.status === 'confirmed' ? styles.statusOk : styles.statusCancel]}>
            {b.status}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionConfirm]}
              onPress={() => setStatus(b.id, 'confirmed')}
              accessibilityLabel="Confirm booking"
            >
              <Text style={styles.actionBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionCancel]}
              onPress={() => setStatus(b.id, 'cancelled')}
              accessibilityLabel="Cancel booking"
            >
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: Spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: Spacing.lg },
  empty: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0' },
  cardId: { fontSize: 11, color: '#64748B', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  cardInfo: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  cardPlayer: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  cardStatus: { fontSize: 12, fontWeight: '700', marginBottom: Spacing.sm },
  statusOk: { color: Palette.success },
  statusCancel: { color: Palette.danger },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionConfirm: { backgroundColor: Palette.success },
  actionCancel: { backgroundColor: Palette.danger },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
