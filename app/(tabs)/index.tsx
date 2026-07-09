import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadow } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Find Courts',    color: '#E8F4FD', accent: '#1A8FE3', route: '/(tabs)/courts'    },
  { icon: '📅', label: 'Book a Court',   color: '#E8F8EF', accent: '#27AE60', route: '/(tabs)/courts'    },
  { icon: '📋', label: 'My Bookings',    color: '#FFF3E0', accent: '#F39C12', route: '/(tabs)/bookings'  },
  { icon: '💳', label: 'Pay Online',     color: '#F3E5F5', accent: '#8E44AD', route: '/(tabs)/payments'  },
  { icon: '🔔', label: 'Notifications',  color: '#FCE4EC', accent: '#E91E63', route: '/notifications'    },
  { icon: '⚙️', label: 'Settings',       color: '#E0F7FA', accent: '#00ACC1', route: '/settings'         },
];

const UPCOMING_BOOKINGS = [
  { id: '1', court: 'Downtown Pickleball Center', date: 'Today',    time: '6:00 PM',  status: 'confirmed', amount: 420  },
  { id: '2', court: 'Riverside Courts',           date: 'Tomorrow', time: '9:00 AM',  status: 'confirmed', amount: 315  },
  { id: '3', court: 'Sunset Pavilion',            date: 'Jul 15',   time: '7:00 PM',  status: 'pending',   amount: 378  },
];

const NEARBY_COURTS = [
  { id: '1', name: 'Downtown Pickleball Center', dist: '0.8 km', price: 20, rating: 4.8, slots: 6,  type: 'Indoor',  image: 'https://picsum.photos/seed/court1/400/200' },
  { id: '2', name: 'Riverside Courts',           dist: '1.2 km', price: 15, rating: 4.5, slots: 3,  type: 'Outdoor', image: 'https://picsum.photos/seed/court2/400/200' },
  { id: '3', name: 'Sunset Pavilion',            dist: '2.0 km', price: 18, rating: 4.7, slots: 8,  type: 'Covered', image: 'https://picsum.photos/seed/court3/400/200' },
  { id: '4', name: 'Northpark Arena',            dist: '3.1 km', price: 22, rating: 4.9, slots: 2,  type: 'Indoor',  image: 'https://picsum.photos/seed/court4/400/200' },
];

const PROMOS = [
  { id: '1', tag: '🎉 Promo',    title: 'Weekend 20% Off',           body: 'Use code WEEKEND20 on any booking this Sat or Sun.',          color: '#27AE60' },
  { id: '2', tag: '⚡ Limited',  title: 'Early Bird — 15% Off',      body: 'Book before 8AM and save 15%. Slots are filling fast!',       color: Palette.primary },
  { id: '3', tag: 'ℹ️ New',      title: 'Bayview Courts Now Open',   body: '4 new outdoor courts available. Book your slot today.',       color: '#F39C12' },
];

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
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
  title: { fontSize: 17, fontWeight: '800', color: Palette.grey900 },
  link:  { fontSize: 13, color: Palette.primary, fontWeight: '600' },
});

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ item, onPress }: { item: typeof UPCOMING_BOOKINGS[0]; onPress: () => void }) {
  const isPending  = item.status === 'pending';
  const statusColor = isPending ? Palette.warning : Palette.success;
  return (
    <TouchableOpacity style={[bk.card, shadow('sm')]} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.court}>
      <View style={[bk.accent, { backgroundColor: statusColor }]} />
      <View style={bk.body}>
        <View style={bk.row}>
          <Text style={bk.court} numberOfLines={1}>{item.court}</Text>
          <View style={[bk.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[bk.badgeText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={bk.meta}>📅 {item.date} · 🕐 {item.time}</Text>
        <Text style={bk.amount}>₱{item.amount.toFixed(2)}</Text>
      </View>
      <Text style={bk.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const bk = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, overflow: 'hidden' },
  accent:    { width: 4, alignSelf: 'stretch' },
  body:      { flex: 1, padding: Spacing.md },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  court:     { fontSize: 14, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 8 },
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  meta:      { fontSize: 12, color: Palette.grey600, marginBottom: 4 },
  amount:    { fontSize: 14, fontWeight: '800', color: Palette.primary },
  chevron:   { fontSize: 22, color: Palette.grey400, paddingRight: Spacing.sm },
});

// ─── Court card (horizontal) ──────────────────────────────────────────────────
function CourtCard({ item, onPress }: { item: typeof NEARBY_COURTS[0]; onPress: () => void }) {
  const typeColors: Record<string, string> = { Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24' };
  const tc = typeColors[item.type] ?? Palette.primary;
  return (
    <TouchableOpacity style={[ct.card, shadow('sm')]} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.name}>
      <View style={ct.imgWrap}>
        <Image source={{ uri: item.image }} style={ct.img} contentFit="cover" />
        <View style={[ct.typeBadge, { backgroundColor: tc + '33' }]}>
          <Text style={[ct.typeText, { color: tc }]}>{item.type}</Text>
        </View>
      </View>
      <View style={ct.body}>
        <Text style={ct.name} numberOfLines={1}>{item.name}</Text>
        <Text style={ct.dist}>📍 {item.dist}</Text>
        <View style={ct.metaRow}>
          <Text style={ct.rating}>⭐ {item.rating}</Text>
          <Text style={ct.slots}>{item.slots} free</Text>
        </View>
        <Text style={ct.price}>₱{item.price}/hr</Text>
      </View>
    </TouchableOpacity>
  );
}
const ct = StyleSheet.create({
  card:      { width: 160, backgroundColor: '#fff', borderRadius: Radius.md, marginRight: Spacing.sm, overflow: 'hidden' },
  imgWrap:   { position: 'relative', height: 95 },
  img:       { width: '100%', height: 95 },
  typeBadge: { position: 'absolute', bottom: 5, right: 5, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  typeText:  { fontSize: 9, fontWeight: '800' },
  body:      { padding: Spacing.sm },
  name:      { fontSize: 12, fontWeight: '700', color: Palette.grey900 },
  dist:      { fontSize: 11, color: Palette.grey500, marginTop: 2 },
  metaRow:   { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  rating:    { fontSize: 11, color: Palette.grey700 },
  slots:     { fontSize: 11, color: Palette.success, fontWeight: '600' },
  price:     { fontSize: 13, fontWeight: '800', color: Palette.primary, marginTop: 4 },
});

// ─── Promo card ───────────────────────────────────────────────────────────────
function PromoCard({ item }: { item: typeof PROMOS[0] }) {
  return (
    <View style={[pr.card, { borderLeftColor: item.color, borderLeftWidth: 4 }, shadow('sm')]}>
      <View style={pr.top}>
        <View style={[pr.tag, { backgroundColor: item.color + '22' }]}>
          <Text style={[pr.tagText, { color: item.color }]}>{item.tag}</Text>
        </View>
      </View>
      <Text style={pr.title}>{item.title}</Text>
      <Text style={pr.body} numberOfLines={2}>{item.body}</Text>
    </View>
  );
}
const pr = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md },
  top:     { marginBottom: 6 },
  tag:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  tagText: { fontSize: 11, fontWeight: '700' },
  title:   { fontSize: 14, fontWeight: '800', color: Palette.grey900, marginBottom: 4 },
  body:    { fontSize: 13, color: Palette.grey600, lineHeight: 18 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const { user }  = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.notifBtn, shadow('sm')]} onPress={() => router.push('/notifications')} accessibilityLabel="Notifications">
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Profile">
              <View style={[styles.avatar, shadow('sm')]}>
                <Text style={styles.avatarText}>
                  {(user?.name ?? 'P').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero CTA ── */}
        <TouchableOpacity
          style={[styles.heroCta, shadow('lg')]}
          onPress={() => router.push('/(tabs)/courts')}
          accessibilityRole="button"
          accessibilityLabel="Book a court now"
        >
          <View style={styles.heroCtaLeft}>
            <Text style={styles.heroCtaTitle}>Book a Court</Text>
            <Text style={styles.heroCtaSub}>Find available courts near you and book instantly</Text>
          </View>
          <Text style={styles.heroCtaEmoji}>🏓</Text>
        </TouchableOpacity>

        {/* ── Quick Actions ── */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: a.color }]}
              onPress={() => router.push(a.route as any)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionLabel, { color: a.accent }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Upcoming Bookings ── */}
        <SectionHeader title="Upcoming Bookings" onSeeAll={() => router.push('/(tabs)/bookings')} />
        {UPCOMING_BOOKINGS.map((b) => (
          <BookingCard key={b.id} item={b} onPress={() => router.push('/(tabs)/bookings')} />
        ))}

        {/* ── Nearby Courts ── */}
        <SectionHeader title="Nearby Courts" onSeeAll={() => router.push('/(tabs)/courts')} />
        <FlatList
          horizontal
          data={NEARBY_COURTS}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.courtList}
          renderItem={({ item }) => (
            <CourtCard item={item} onPress={() => router.push(`/courts/${item.id}` as any)} />
          )}
        />

        {/* ── Promos ── */}
        <SectionHeader title="Offers & Updates" />
        {PROMOS.map((p) => <PromoCard key={p.id} item={p} />)}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Palette.grey100 },
  content: { paddingBottom: Spacing.xl },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:    { fontSize: 13, color: Palette.grey500 },
  userName:    { fontSize: 24, fontWeight: '900', color: Palette.grey900, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifIcon:   { fontSize: 18 },
  notifDot:    { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.danger, borderWidth: 2, borderColor: '#fff' },
  avatarWrap:  { position: 'relative' },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText:  { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:   { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: Palette.success, borderWidth: 2, borderColor: '#fff' },

  heroCta:      { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Palette.primary, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCtaLeft:  { flex: 1 },
  heroCtaTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroCtaSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroCtaEmoji: { fontSize: 52 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:   { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 3, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, alignItems: 'center', gap: 6 },
  actionIcon:  { fontSize: 26 },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },

  courtList: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },
});
