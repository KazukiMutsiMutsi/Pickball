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

type UserStatus = 'active' | 'suspended';

interface AppUser {
  id: string; name: string; email: string; phone: string;
  joined: string; bookings: number; spent: number; status: UserStatus;
}

const ALL_USERS: AppUser[] = [
  { id: 'U001', name: 'Juan dela Cruz',     email: 'juan@email.com',     phone: '+63 917 123 4567', joined: '2026-01-15', bookings: 12, spent: 4620,  status: 'active'    },
  { id: 'U002', name: 'Maria Santos',       email: 'maria@email.com',    phone: '+63 918 234 5678', joined: '2026-02-20', bookings: 7,  spent: 2520,  status: 'active'    },
  { id: 'U003', name: 'Pedro Reyes',        email: 'pedro@email.com',    phone: '+63 919 345 6789', joined: '2026-03-05', bookings: 20, spent: 8200,  status: 'active'    },
  { id: 'U004', name: 'Ana Gonzales',       email: 'ana@email.com',      phone: '+63 912 456 7890', joined: '2026-03-18', bookings: 3,  spent: 900,   status: 'suspended' },
  { id: 'U005', name: 'Jose Rizal',         email: 'jose@email.com',     phone: '+63 915 567 8901', joined: '2026-04-01', bookings: 15, spent: 6300,  status: 'active'    },
  { id: 'U006', name: 'Andres Bonifacio',   email: 'andres@email.com',   phone: '+63 916 678 9012', joined: '2026-04-22', bookings: 8,  spent: 2800,  status: 'active'    },
  { id: 'U007', name: 'Emilio Aguinaldo',   email: 'emilio@email.com',   phone: '+63 920 789 0123', joined: '2026-05-10', bookings: 5,  spent: 1750,  status: 'suspended' },
];

export default function AdminUsers() {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<'all' | UserStatus>('all');
  const [users,   setUsers]   = useState(ALL_USERS);

  const toggleStatus = (id: string) =>
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));

  const filtered = users.filter((u) => {
    const matchFilter = filter === 'all' || u.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.count}>{users.length} registered</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total',     value: users.length,                              color: '#60A5FA' },
          { label: 'Active',    value: users.filter(u => u.status === 'active').length, color: '#34D399' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: '#F87171' },
          { label: 'Total Spent', value: '₱' + (users.reduce((s, u) => s + u.spent, 0) / 1000).toFixed(0) + 'k', color: PURPLE },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 2 }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name or email…"
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search users"
        />
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'suspended'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userPhone}>{item.phone}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusSuspended]}>
                <Text style={[styles.statusText, { color: item.status === 'active' ? '#34D399' : '#F87171' }]}>
                  {item.status === 'active' ? 'Active' : 'Suspended'}
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{item.bookings}</Text>
                <Text style={styles.statItemLabel}>Bookings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>₱{item.spent.toLocaleString()}</Text>
                <Text style={styles.statItemLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{item.joined}</Text>
                <Text style={styles.statItemLabel}>Joined</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.viewBtn} accessibilityLabel={`View ${item.name}`}>
                <Text style={styles.viewBtnText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, item.status === 'active' ? styles.suspendBtn : styles.activateBtn]}
                onPress={() => toggleStatus(item.id)}
                accessibilityLabel={item.status === 'active' ? `Suspend ${item.name}` : `Activate ${item.name}`}
              >
                <Text style={[styles.toggleBtnText, { color: item.status === 'active' ? '#F87171' : '#34D399' }]}>
                  {item.status === 'active' ? 'Suspend' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: DARK },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title:          { fontSize: 22, fontWeight: '800', color: '#fff' },
  count:          { fontSize: 13, color: '#9CA3AF' },
  summaryRow:     { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard:       { flex: 1, backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statValue:      { fontSize: 16, fontWeight: '900' },
  statLabel:      { fontSize: 9, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 11 },
  searchIcon:     { fontSize: 14, marginRight: 8 },
  searchInput:    { flex: 1, fontSize: 14, color: '#fff' },
  filterRow:      { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: CARD, borderWidth: 1, borderColor: '#3D3A55' },
  chipActive:     { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText:       { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list:           { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  empty:          { color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card:           { backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.md },
  cardTop:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  avatar:         { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE + '44', alignItems: 'center', justifyContent: 'center' },
  avatarText:     { color: '#fff', fontWeight: '800', fontSize: 18 },
  userInfo:       { flex: 1 },
  userName:       { fontSize: 15, fontWeight: '700', color: '#fff' },
  userEmail:      { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  userPhone:      { fontSize: 12, color: '#9CA3AF' },
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  statusActive:   { backgroundColor: '#34D399' + '22' },
  statusSuspended:{ backgroundColor: '#F87171' + '22' },
  statusText:     { fontSize: 11, fontWeight: '700' },
  statsRow:       { flexDirection: 'row', marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#3D3A55', paddingTop: Spacing.sm },
  statItem:       { flex: 1, alignItems: 'center' },
  statItemValue:  { fontSize: 13, fontWeight: '700', color: '#fff' },
  statItemLabel:  { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  cardActions:    { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  viewBtn:        { flex: 1, backgroundColor: PURPLE + '22', borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  viewBtnText:    { color: PURPLE, fontSize: 12, fontWeight: '600' },
  toggleBtn:      { flex: 1, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  suspendBtn:     { backgroundColor: '#F87171' + '22' },
  activateBtn:    { backgroundColor: '#34D399' + '22' },
  toggleBtnText:  { fontSize: 12, fontWeight: '600' },
});
