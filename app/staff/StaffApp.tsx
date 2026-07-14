import { Palette, Spacing } from '@/constants/theme';
import { getAllBookings, updateBooking } from '@/src/booking/bookingStore';
import type { BookingStatus } from '@/src/staff/types';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TODAY = new Date().toISOString().slice(0, 10);

/**
 * Minimal staff portal (web only).
 * Shows today's bookings and lets staff check-in players.
 */
export default function StaffApp() {
  const [, forceUpdate] = useState(0);
  const bookings = getAllBookings().filter((b) => b.date === TODAY);

  const setStatus = (id: string, status: BookingStatus) => {
    updateBooking(id, { status });
    forceUpdate((n) => n + 1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏓 PicklePro Staff</Text>
      <Text style={styles.subtitle}>Today's Bookings — {TODAY} ({bookings.length})</Text>

      {bookings.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No bookings for today yet.</Text>
        </View>
      )}

      {bookings.map((b) => (
        <View key={b.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardCourt}>{b.courtName}</Text>
            <Text style={[
              styles.cardStatus,
              b.status === 'confirmed' ? styles.statusOk :
              b.status === 'completed' ? styles.statusDone :
              styles.statusCancel,
            ]}>
              {b.status}
            </Text>
          </View>
          <Text style={styles.cardTime}>{b.startTime} – {b.endTime}</Text>
          <Text style={styles.cardPlayer}>{b.playerName || 'Customer'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionCheckIn]}
              onPress={() => setStatus(b.id, 'completed')}
              accessibilityLabel="Check in player"
            >
              <Text style={styles.actionBtnText}>✓ Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionNoShow]}
              onPress={() => setStatus(b.id, 'no_show')}
              accessibilityLabel="Mark as no show"
            >
              <Text style={styles.actionBtnText}>No Show</Text>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardCourt: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  cardStatus: { fontSize: 12, fontWeight: '700' },
  statusOk: { color: Palette.success },
  statusDone: { color: '#2196F3' },
  statusCancel: { color: Palette.danger },
  cardTime: { fontSize: 14, color: '#0F172A', fontWeight: '600', marginBottom: 2 },
  cardPlayer: { fontSize: 13, color: '#64748B', marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionCheckIn: { backgroundColor: Palette.success },
  actionNoShow: { backgroundColor: '#94A3B8' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
