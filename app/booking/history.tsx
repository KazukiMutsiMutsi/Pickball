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

interface BookingRecord {
  id: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
  status: Status;
  paymentMethod: string;
}

const MOCK: BookingRecord[] = [
  { id: 'BKG-A1B2C3', courtName: 'Court 1', date: '2026-07-12', startTime: '09:00', endTime: '11:00', duration: 2,   total: 42,    status: 'upcoming',  paymentMethod: 'Credit Card' },
  { id: 'BKG-D4E5F6', courtName: 'Court 2', date: '2026-07-05', startTime: '14:00', endTime: '15:30', duration: 1.5, total: 23.63, status: 'completed', paymentMethod: 'PayPal'      },
  { id: 'BKG-G7H8I9', courtName: 'Court 3', date: '2026-06-28', startTime: '16:00', endTime: '18:00', duration: 2,   total: 37.8,  status: 'completed', paymentMethod: 'Apple Pay'   },
  { id: 'BKG-J1K2L3', courtName: 'Court 1', date: '2026-06-15', startTime: '10:00', endTime: '12:00', duration: 2,   total: 46.2,  status: 'cancelled', paymentMethod: 'Credit Card' },
];

const TABS: { key: 'all' | Status; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLOR: Record<Status, { bg: string; text: string }> = {
  upcoming:  { bg: '#E8F4FD', text: Palette.primary  },
  completed: { bg: '#E8F8EF', text: Palette.success  },
  cancelled: { bg: '#FDECEA', text: Palette.danger   },
};

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookingHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | Status>('all');

  const filtered = activeTab === 'all' ? MOCK : MOCK.filter((b) => b.status === activeTab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings here yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors = STATUS_COLOR[item.status];
          return (
            <View style={[styles.card, shadowMd]}>
              <View style={styles.cardHeader}>
                <Text style={styles.courtName} numberOfLines={1}>{item.courtName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaItem}>{formatDate(item.date)}</Text>
                <Text style={styles.metaItem}>{to12h(item.startTime)} – {to12h(item.endTime)}</Text>
                <Text style={styles.metaItem}>{item.duration} hr{item.duration !== 1 ? 's' : ''}</Text>
                <Text style={styles.metaItem}>{item.paymentMethod}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.bookingId}>{item.id}</Text>
                <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
              </View>
              {item.status === 'upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Reschedule booking">
                    <Text style={styles.actionBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} accessibilityRole="button" accessibilityLabel="Cancel booking">
                    <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === 'completed' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rebookBtn]}
                  onPress={() => router.push('/courts')}
                  accessibilityRole="button"
                  accessibilityLabel="Book again"
                >
                  <Text style={[styles.actionBtnText, { color: Palette.primary }]}>Book Again</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Palette.grey100 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:      { width: 40 },
  backIcon:     { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:        { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  tabs:         { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: Palette.primary },
  tabText:      { fontSize: 13, color: Palette.grey500, fontWeight: '500' },
  tabTextActive:{ color: Palette.primary, fontWeight: '700' },
  list:         { padding: Spacing.md, gap: Spacing.sm },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyText:    { fontSize: 15, color: Palette.grey500 },
  card:         { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  courtName:    { fontSize: 15, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 8 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  statusText:   { fontSize: 12, fontWeight: '700' },
  cardMeta:     { gap: 4, marginBottom: Spacing.sm },
  metaItem:     { fontSize: 13, color: Palette.grey600 },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Palette.grey200, paddingTop: Spacing.sm },
  bookingId:    { fontSize: 11, color: Palette.grey500 },
  totalAmount:  { fontSize: 16, fontWeight: '800', color: Palette.grey900 },
  actionRow:    { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn:    { flex: 1, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 9, alignItems: 'center' },
  actionBtnText:{ fontSize: 13, color: Palette.primary, fontWeight: '600' },
  cancelBtn:    { borderColor: Palette.danger },
  cancelBtnText:{ color: Palette.danger },
  rebookBtn:    { marginTop: Spacing.sm, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 9, alignItems: 'center' },
});
