import { Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE  = '#7C3AED';
const DARK    = '#1E1B2E';
const CARD_BG = '#2A2640';

const { width } = Dimensions.get('window');

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, change, color }: {
  icon: string; label: string; value: string; change: string; color: string;
}) {
  const positive = change.startsWith('+');
  return (
    <View style={[statStyles.card, { borderLeftColor: color }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + '22' }]}>
        <Text style={statStyles.icon}>{icon}</Text>
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.change, { color: positive ? '#34D399' : '#F87171' }]}>{change} this week</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card:     { flex: 1, backgroundColor: CARD_BG, borderRadius: 16, padding: Spacing.md, borderLeftWidth: 3, minWidth: (width - 56) / 2 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon:     { fontSize: 20 },
  value:    { fontSize: 26, fontWeight: '900', color: '#fff' },
  label:    { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  change:   { fontSize: 11, fontWeight: '600', marginTop: 4 },
});

// ─── Recent booking row ───────────────────────────────────────────────────────
function BookingRow({ name, court, time, status }: {
  name: string; court: string; time: string; status: 'confirmed' | 'pending' | 'cancelled';
}) {
  const colors = { confirmed: '#34D399', pending: '#FBBF24', cancelled: '#F87171' };
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarText}>{name[0]}</Text>
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name}>{name}</Text>
        <Text style={rowStyles.sub}>{court} · {time}</Text>
      </View>
      <View style={[rowStyles.badge, { backgroundColor: colors[status] + '22' }]}>
        <Text style={[rowStyles.badgeText, { color: colors[status] }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  avatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: PURPLE + '44', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  info:       { flex: 1 },
  name:       { color: '#fff', fontWeight: '600', fontSize: 14 },
  sub:        { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  badge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: '💰', label: 'Revenue',     value: '₱48,250', change: '+12%',  color: '#34D399' },
  { icon: '📅', label: 'Bookings',    value: '134',      change: '+8%',   color: '#60A5FA' },
  { icon: '🏓', label: 'Courts',      value: '5',        change: '+0%',   color: '#FBBF24' },
  { icon: '👥', label: 'Active Users',value: '312',      change: '+21%',  color: '#F472B6' },
];

const RECENT = [
  { name: 'Juan dela Cruz', court: 'Court 1', time: '09:00–11:00', status: 'confirmed' as const },
  { name: 'Maria Santos',   court: 'Court 2', time: '14:00–15:30', status: 'pending'   as const },
  { name: 'Pedro Reyes',    court: 'Court 3', time: '16:00–18:00', status: 'confirmed' as const },
  { name: 'Ana Gonzales',   court: 'Court 1', time: '10:00–12:00', status: 'cancelled' as const },
  { name: 'Jose Rizal',     court: 'Court 2', time: '08:00–09:00', status: 'confirmed' as const },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerRole}>Admin Panel</Text>
            <Text style={styles.headerName}>Welcome, {user?.name ?? 'Admin'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityLabel="Logout">
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats grid ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </View>

        {/* ── Revenue chart placeholder ── */}
        <Text style={styles.sectionTitle}>Revenue This Month</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={[styles.bar, { height: h * 0.9, backgroundColor: i === 11 ? PURPLE : '#4C4870' }]} />
              </View>
            ))}
          </View>
          <View style={styles.chartLabels}>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
              <Text key={m} style={styles.chartLabel}>{m}</Text>
            ))}
          </View>
          <Text style={styles.chartNote}>Total: ₱384,500 YTD</Text>
        </View>

        {/* ── Quick actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          {[
            { icon: '➕', label: 'Add Court',    onPress: () => router.push('/(admin)/courts')   },
            { icon: '📋', label: 'All Bookings', onPress: () => router.push('/(admin)/bookings') },
            { icon: '👥', label: 'Manage Users', onPress: () => router.push('/(admin)/users')   },
            { icon: '📸', label: 'QR Scanner',   onPress: () => router.push('/(admin)/scanner') },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.label}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent bookings ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/bookings')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentCard}>
          {RECENT.map((r, i) => (
            <React.Fragment key={r.name}>
              {i > 0 && <View style={styles.divider} />}
              <BookingRow {...r} />
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: DARK },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.md, paddingBottom: Spacing.sm },
  headerRole:   { fontSize: 12, color: PURPLE, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  headerName:   { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  logoutBtn:    { backgroundColor: '#F87171' + '22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  logoutText:   { color: '#F87171', fontWeight: '700', fontSize: 13 },

  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#E2E8F0', marginLeft: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.md },
  seeAll:        { fontSize: 13, color: PURPLE, fontWeight: '600', marginBottom: Spacing.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },

  chartCard:   { backgroundColor: CARD_BG, borderRadius: 16, marginHorizontal: Spacing.md, padding: Spacing.md },
  chartBars:   { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 4 },
  barWrap:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:         { width: '80%', borderRadius: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel:  { fontSize: 8, color: '#6B7280' },
  chartNote:   { fontSize: 12, color: '#9CA3AF', marginTop: Spacing.sm, textAlign: 'right' },

  actions:     { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:   { flex: 1, backgroundColor: CARD_BG, borderRadius: 16, paddingVertical: Spacing.md, alignItems: 'center', gap: 6 },
  actionIcon:  { fontSize: 22 },
  actionLabel: { fontSize: 11, color: '#E2E8F0', fontWeight: '600', textAlign: 'center' },

  recentCard: { backgroundColor: CARD_BG, borderRadius: 16, marginHorizontal: Spacing.md, paddingHorizontal: Spacing.md },
  divider:    { height: 1, backgroundColor: '#3D3A55' },
});
