import { formatPHP, Layout, Palette, Spacing } from '@/constants/theme';
import { BookingCalendar } from '@/src/components/BookingCalendar';
import { useAuth } from '@/src/hooks/useAuth';
import { shadow, shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
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

const { width: W } = Dimensions.get('window');

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Find Courts',  color: '#E8F4FD', accent: '#1A8FE3', route: '/courts'           },
  { icon: '📋', label: 'My Bookings', color: '#FFF3E0', accent: '#F39C12', route: '/(tabs)/bookings'  },
  { icon: '💳', label: 'Pay Online',  color: '#F3E5F5', accent: '#8E44AD', route: '/(tabs)/payments'  },
  { icon: '🔔', label: 'Alerts',      color: '#FCE4EC', accent: '#E91E63', route: '/notifications'    },
];

// ─── Upcoming bookings ────────────────────────────────────────────────────────
const UPCOMING = [
  { id: '1', court: 'Court 1', date: 'Today',    time: '6:00 PM', status: 'confirmed', amount: 420 },
  { id: '2', court: 'Court 2', date: 'Tomorrow', time: '9:00 AM', status: 'confirmed', amount: 315 },
  { id: '3', court: 'Court 3', date: 'Jul 15',   time: '7:00 PM', status: 'pending',   amount: 378 },
];


// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Section header ───────────────────────────────────────────────────────────
function SH({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
          <Text style={sh.link}>See all →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  link:  { fontSize: 13, color: Palette.primary, fontWeight: '600' },
});

// ─── Upcoming booking card ────────────────────────────────────────────────────
function BookingCard({ item, onPress }: { item: typeof UPCOMING[0]; onPress: () => void }) {
  const c = item.status === 'pending' ? Palette.warning : Palette.success;
  return (
    <TouchableOpacity style={[bk.card, shadowSm]} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.court}>
      <View style={[bk.accent, { backgroundColor: c }]} />
      <View style={bk.body}>
        <View style={bk.row}>
          <Text style={bk.court} numberOfLines={1}>{item.court}</Text>
          <View style={[bk.badge, { backgroundColor: c + '22' }]}>
            <Text style={[bk.badgeText, { color: c }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={bk.meta}>📅 {item.date} · 🕐 {item.time}</Text>
        <Text style={bk.amount}>{formatPHP(item.amount)}</Text>
      </View>
      <Text style={bk.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const bk = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, marginHorizontal: Spacing.md, marginBottom: 12, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  accent:    { width: 4, alignSelf: 'stretch' },
  body:      { flex: 1, padding: Spacing.md },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  court:     { fontSize: 15, fontWeight: '600', color: '#0F172A', flex: 1, marginRight: 8 },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  meta:      { fontSize: 12, color: '#64748B', marginBottom: 4 },
  amount:    { fontSize: 14, fontWeight: '800', color: Palette.primary },
  chevron:   { fontSize: 22, color: Palette.grey400, paddingRight: Spacing.sm },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const { user }  = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pageWrap}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.notifBtn, shadowSm]} onPress={() => router.push('/notifications')} accessibilityLabel="Notifications">
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Profile">
              <View style={[styles.avatar, shadowSm]}>
                <Text style={styles.avatarText}>
                  {(user?.name ?? 'P').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity style={[styles.heroCta, shadow('lg')]} onPress={() => router.push('/courts')} accessibilityRole="button" accessibilityLabel="Book a court">
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Book a Court</Text>
            <Text style={styles.heroSub}>Find available courts and book instantly</Text>
          </View>
          <View style={styles.heroLogoWrap}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.heroLogo}
              contentFit="cover"
              accessibilityLabel="PicklePro logo"
            />
          </View>
        </TouchableOpacity>

        {/* Booking Calendar */}
        <SH title="Book a Slot" onSeeAll={() => router.push('/availability')} />
        <BookingCalendar />

        <View style={{ height: Spacing.xxl }} />
        </View>{/* pageWrap */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F8FAFC' },
  content:      { paddingBottom: Spacing.xl },
  pageWrap:     { alignSelf: 'center', width: '100%', maxWidth: Layout.maxWidth },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:     { fontSize: 13, color: '#64748B' },
  userName:     { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 1 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  notifIcon:    { fontSize: 18 },
  notifDot:     { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#fff' },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },
  heroCta:      { marginHorizontal: Spacing.md, marginBottom: 12, backgroundColor: Palette.primary, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTitle:    { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroLogoWrap: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: '#FFD700' },
  heroLogo:     { width: 64, height: 64 },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:    { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 4, borderRadius: 12, paddingVertical: Spacing.md, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  actionIcon:   { fontSize: 22 },
  actionLabel:  { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
});
