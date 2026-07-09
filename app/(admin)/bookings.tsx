import { Radius, Spacing } from '@/constants/theme';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#7C3AED';
const DARK   = '#1E1B2E';
const CARD   = '#2A2640';

type Status = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface Booking {
  id: string; user: string; court: string;
  date: string; time: string; amount: number; status: Status;
}

const ALL: Booking[] = [
  { id: 'BKG-001', user: 'Juan dela Cruz',   court: 'Downtown Center',  date: '2026-07-12', time: '09:00–11:00', amount: 420,  status: 'confirmed'  },
  { id: 'BKG-002', user: 'Maria Santos',     court: 'Riverside Courts', date: '2026-07-12', time: '14:00–15:30', amount: 315,  status: 'pending'    },
  { id: 'BKG-003', user: 'Pedro Reyes',      court: 'Sunset Pavilion',  date: '2026-07-11', time: '16:00–18:00', amount: 378,  status: 'completed'  },
  { id: 'BKG-004', user: 'Ana Gonzales',     court: 'Northpark Arena',  date: '2026-07-10', time: '10:00–12:00', amount: 462,  status: 'cancelled'  },
  { id: 'BKG-005', user: 'Jose Rizal',       court: 'Bayview Courts',   date: '2026-07-10', time: '08:00–09:00', amount: 126,  status: 'confirmed'  },
  { id: 'BKG-006', user: 'Andres Bonifacio', court: 'Downtown Center',  date: '2026-07-09', time: '17:00–19:00', amount: 420,  status: 'completed'  },
  { id: 'BKG-007', user: 'Emilio Aguinaldo', court: 'Riverside Courts', date: '2026-07-09', time: '07:00–08:00', amount: 157,  status: 'pending'    },
];

const STATUS_COLOR: Record<Status, { bg: string; text: string }> = {
  confirmed:  { bg: '#34D399' + '22', text: '#34D399' },
  pending:    { bg: '#FBBF24' + '22', text: '#FBBF24' },
  cancelled:  { bg: '#F87171' + '22', text: '#F87171' },
  completed:  { bg: '#60A5FA' + '22', text: '#60A5FA' },
};

const TABS: { key: 'all' | Status; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending',   label: 'Pending'   },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminBookings() {
  const [tab,    setTab]    = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  const data = ALL.filter((b) => {
    const matchTab = tab === 'all' || b.status === tab;
    const q = search.toLowerCase();
    const matchSearch = !q || b.user.toLowerCase().includes(q) || b.court.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.count}>{ALL.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search user, court, ID…"
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search bookings"
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(t) => t.key}
          contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, tab === item.key && styles.chipActive]}
              onPress={() => setTab(item.key)}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, tab === item.key && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No bookings found.</Text>}
        renderItem={({ item }) => {
          const c = STATUS_COLOR[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.bookingId}>{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: c.bg }]}>
                  <Text style={[styles.badgeText, { color: c.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.userName}>{item.user}</Text>
              <Text style={styles.meta}>{item.court}</Text>
              <Text style={styles.meta}>📅 {item.date} · {item.time}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
                <View style={styles.cardActions}>
                  {item.status === 'pending' && (
                    <TouchableOpacity style={styles.approveBtn} accessibilityLabel="Approve">
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.viewBtn} accessibilityLabel="View details">
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: DARK },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title:        { fontSize: 22, fontWeight: '800', color: '#fff' },
  count:        { fontSize: 13, color: '#9CA3AF' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 11 },
  searchIcon:   { fontSize: 14, marginRight: 8 },
  searchInput:  { flex: 1, fontSize: 14, color: '#fff' },
  tabsWrap:     { marginBottom: Spacing.sm },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: CARD, borderWidth: 1, borderColor: '#3D3A55' },
  chipActive:   { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText:     { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  chipTextActive:{ color: '#fff', fontWeight: '700' },
  list:         { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  empty:        { color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card:         { backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.md },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bookingId:    { fontSize: 11, color: '#6B7280', fontFamily: 'monospace' },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  userName:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  meta:         { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  cardBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  amount:       { fontSize: 18, fontWeight: '900', color: '#34D399' },
  cardActions:  { flexDirection: 'row', gap: Spacing.sm },
  approveBtn:   { backgroundColor: '#34D399' + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  approveBtnText:{ fontSize: 12, color: '#34D399', fontWeight: '700' },
  viewBtn:      { backgroundColor: PURPLE + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  viewBtnText:  { fontSize: 12, color: PURPLE, fontWeight: '700' },
});
