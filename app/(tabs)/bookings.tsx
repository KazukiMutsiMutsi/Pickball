import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowMd } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Status = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
  status: Status;
  paymentMethod: string;
  paid: boolean;
}

const BOOKINGS: Booking[] = [
  { id: 'BKG-001', courtName: 'Downtown Pickleball Center', date: '2026-07-12', startTime: '09:00', endTime: '11:00', duration: 2,   total: 42.00, status: 'upcoming',  paymentMethod: 'GCash',       paid: true  },
  { id: 'BKG-002', courtName: 'Riverside Courts',           date: '2026-07-15', startTime: '14:00', endTime: '15:30', duration: 1.5, total: 23.63, status: 'upcoming',  paymentMethod: 'Unpaid',      paid: false },
  { id: 'BKG-003', courtName: 'Sunset Pavilion',            date: '2026-07-05', startTime: '16:00', endTime: '18:00', duration: 2,   total: 37.80, status: 'completed', paymentMethod: 'Credit Card', paid: true  },
  { id: 'BKG-004', courtName: 'Northpark Arena',            date: '2026-06-28', startTime: '10:00', endTime: '12:00', duration: 2,   total: 46.20, status: 'completed', paymentMethod: 'Maya',        paid: true  },
  { id: 'BKG-005', courtName: 'Bayview Open Courts',        date: '2026-06-15', startTime: '07:00', endTime: '08:00', duration: 1,   total: 12.60, status: 'cancelled', paymentMethod: 'Refunded',    paid: false },
];

const TABS: { key: 'all' | Status; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLE: Record<Status, { bg: string; text: string }> = {
  upcoming:  { bg: '#E8F4FD', text: Palette.primary  },
  completed: { bg: '#E8F8EF', text: Palette.success  },
  cancelled: { bg: '#FDECEA', text: Palette.danger   },
};

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookingsTab() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | Status>('all');

  const data = tab === 'all' ? BOOKINGS : BOOKINGS.filter((b) => b.status === tab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/(tabs)/courts')}
          accessibilityRole="button"
          accessibilityLabel="Book a court"
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySub}>Find a court and make your first booking</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/courts')} accessibilityRole="button" accessibilityLabel="Find courts">
              <Text style={styles.emptyBtnText}>Find Courts</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const sc = STATUS_STYLE[item.status];
          return (
            <View style={[styles.card, shadowMd]}>
              {/* Top */}
              <View style={styles.cardTop}>
                <Text style={styles.courtName} numberOfLines={1}>{item.courtName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <Text style={styles.meta}>📅 {fmtDate(item.date)}</Text>
              <Text style={styles.meta}>🕐 {to12h(item.startTime)} – {to12h(item.endTime)} · {item.duration}hr{item.duration !== 1 ? 's' : ''}</Text>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.bookingId}>{item.id}</Text>
                  <View style={[styles.payBadge, item.paid ? styles.payBadgePaid : styles.payBadgeUnpaid]}>
                    <Text style={[styles.payBadgeText, { color: item.paid ? Palette.success : Palette.warning }]}>
                      {item.paid ? `✓ ${item.paymentMethod}` : '⚠️ Payment Pending'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.amount}>₱{item.total.toFixed(2)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {!item.paid && item.status === 'upcoming' && (
                  <TouchableOpacity
                    style={styles.payNowBtn}
                    onPress={() => router.push('/(tabs)/payments')}
                    accessibilityRole="button"
                    accessibilityLabel="Pay now"
                  >
                    <Text style={styles.payNowBtnText}>💳 Pay Now</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'upcoming' && (
                  <TouchableOpacity style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Cancel booking">
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'completed' && (
                  <TouchableOpacity style={styles.rebookBtn} onPress={() => router.push('/(tabs)/courts')} accessibilityRole="button" accessibilityLabel="Book again">
                    <Text style={styles.rebookBtnText}>Book Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Palette.grey100 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  title:         { fontSize: 22, fontWeight: '900', color: Palette.grey900 },
  newBtn:        { backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  newBtnText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabRow:        { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  tabBtn:        { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:  { borderBottomColor: Palette.primary },
  tabText:       { fontSize: 12, color: Palette.grey500, fontWeight: '500' },
  tabTextActive: { color: Palette.primary, fontWeight: '700' },
  list:          { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  empty:         { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.lg },
  emptyEmoji:    { fontSize: 52 },
  emptyTitle:    { fontSize: 18, fontWeight: '800', color: Palette.grey900, marginTop: Spacing.md },
  emptySub:      { fontSize: 14, color: Palette.grey500, marginTop: 6, textAlign: 'center' },
  emptyBtn:      { marginTop: Spacing.lg, backgroundColor: Palette.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: Radius.full },
  emptyBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  card:          { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courtName:     { fontSize: 15, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 8 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  statusText:    { fontSize: 11, fontWeight: '700' },
  meta:          { fontSize: 13, color: Palette.grey600, marginBottom: 2 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Palette.grey100 },
  bookingId:     { fontSize: 10, color: Palette.grey400, marginBottom: 4 },
  payBadge:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  payBadgePaid:  { backgroundColor: '#E8F8EF' },
  payBadgeUnpaid:{ backgroundColor: '#FFF8E1' },
  payBadgeText:  { fontSize: 11, fontWeight: '600' },
  amount:        { fontSize: 18, fontWeight: '900', color: Palette.grey900 },
  actions:       { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  payNowBtn:     { flex: 1, backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  payNowBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn:     { flex: 1, borderWidth: 1, borderColor: Palette.danger, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: Palette.danger, fontWeight: '600', fontSize: 13 },
  rebookBtn:     { flex: 1, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  rebookBtnText: { color: Palette.primary, fontWeight: '600', fontSize: 13 },
});
