import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadow } from '@/src/utils/shadow';
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
  { icon: '🔍', label: 'Find Courts',      color: '#E8F4FD', accent: Palette.primary,   route: '/(tabs)/courts'    },
  { icon: '📅', label: 'Book a Court',     color: '#E8F8EF', accent: '#27AE60',          route: '/courts'           },
  { icon: '⚡', label: 'Join a Game',      color: '#FFF3E0', accent: '#F39C12',          route: '/(tabs)/matches'   },
  { icon: '🏆', label: 'Create a Match',   color: '#F3E5F5', accent: '#8E44AD',          route: '/(tabs)/matches'   },
  { icon: '🥇', label: 'Tournaments',      color: '#FCE4EC', accent: '#E91E63',          route: '/(tabs)/community' },
  { icon: '👥', label: 'Community',        color: '#E0F7FA', accent: '#00ACC1',          route: '/(tabs)/community' },
];

const UPCOMING_GAMES = [
  { id: '1', type: 'Singles',  opponent: 'Maria Santos',     court: 'Downtown Center',  date: 'Today',    time: '6:00 PM',  status: 'confirmed' },
  { id: '2', type: 'Doubles',  opponent: 'Pedro & Ana',      court: 'Riverside Courts', date: 'Tomorrow', time: '9:00 AM',  status: 'confirmed' },
  { id: '3', type: 'Open Game',opponent: 'Open Registration',court: 'Sunset Pavilion',  date: 'Jul 15',   time: '7:00 PM',  status: 'open'      },
];

const NEARBY_COURTS = [
  { id: '1', name: 'Downtown Pickleball Center', dist: '0.8 km', price: 20, rating: 4.8, slots: 6,  type: 'Indoor'  },
  { id: '2', name: 'Riverside Courts',           dist: '1.2 km', price: 15, rating: 4.5, slots: 3,  type: 'Outdoor' },
  { id: '3', name: 'Sunset Pavilion',            dist: '2.0 km', price: 18, rating: 4.7, slots: 8,  type: 'Covered' },
  { id: '4', name: 'Northpark Arena',            dist: '3.1 km', price: 22, rating: 4.9, slots: 2,  type: 'Indoor'  },
];

const ANNOUNCEMENTS = [
  { id: '1', tag: '🏆 Tournament', title: 'Summer Pickleball Open 2026', body: 'Registration is now open for the annual Summer Open. 64-player bracket. Register before July 20.', color: '#FF6B35', date: 'Jul 9' },
  { id: '2', tag: '🎉 Promo',      title: 'Weekend Discount — 20% Off',  body: 'Book any court this Saturday or Sunday and get 20% off. Use code WEEKEND20 at checkout.',        color: '#27AE60', date: 'Jul 8' },
  { id: '3', tag: 'ℹ️ Update',     title: 'New Courts Added at Bayview',  body: '4 new outdoor courts are now available at Bayview. Early morning slots open starting July 12.',    color: Palette.primary, date: 'Jul 7' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Player stats bar ─────────────────────────────────────────────────────────
function PlayerStats() {
  const stats = [
    { label: 'Rating',  value: '4.2', icon: '⭐' },
    { label: 'Wins',    value: '24',  icon: '🏆' },
    { label: 'Losses',  value: '8',   icon: '📉' },
    { label: 'Matches', value: '32',  icon: '⚡' },
    { label: 'Win %',   value: '75%', icon: '📈' },
  ];
  return (
    <View style={[ps.card, shadow('md')]}>
      <View style={ps.headerRow}>
        <Text style={ps.cardTitle}>Player Stats</Text>
        <View style={ps.levelBadge}>
          <Text style={ps.levelText}>⭐ Intermediate</Text>
        </View>
      </View>
      <View style={ps.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={ps.statItem}>
            <Text style={ps.statIcon}>{s.icon}</Text>
            <Text style={ps.statValue}>{s.value}</Text>
            <Text style={ps.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      {/* Win rate progress bar */}
      <View style={ps.progressWrap}>
        <Text style={ps.progressLabel}>Win Rate</Text>
        <View style={ps.progressTrack}>
          <View style={[ps.progressFill, { width: '75%' }]} />
        </View>
        <Text style={ps.progressValue}>75%</Text>
      </View>
    </View>
  );
}
const ps = StyleSheet.create({
  card:         { backgroundColor: '#fff', borderRadius: Radius.lg, marginHorizontal: Spacing.md, padding: Spacing.md },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTitle:    { fontSize: 15, fontWeight: '800', color: Palette.grey900 },
  levelBadge:   { backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  levelText:    { fontSize: 11, color: '#F39C12', fontWeight: '700' },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  statItem:     { alignItems: 'center', flex: 1 },
  statIcon:     { fontSize: 16 },
  statValue:    { fontSize: 18, fontWeight: '900', color: Palette.grey900, marginTop: 2 },
  statLabel:    { fontSize: 10, color: Palette.grey500, marginTop: 2 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressLabel:{ fontSize: 11, color: Palette.grey600, width: 58 },
  progressTrack:{ flex: 1, height: 6, backgroundColor: Palette.grey200, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Palette.primary, borderRadius: 3 },
  progressValue:{ fontSize: 11, color: Palette.primary, fontWeight: '700', width: 32, textAlign: 'right' },
});

// ─── Upcoming game card ───────────────────────────────────────────────────────
function GameCard({ item, onPress }: { item: typeof UPCOMING_GAMES[0]; onPress: () => void }) {
  const isOpen = item.status === 'open';
  return (
    <TouchableOpacity style={gc.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Game against ${item.opponent}`}>
      {/* Left accent */}
      <View style={[gc.accent, { backgroundColor: isOpen ? Palette.warning : Palette.success }]} />
      <View style={gc.body}>
        <View style={gc.topRow}>
          <Text style={gc.type}>{item.type}</Text>
          <View style={[gc.badge, { backgroundColor: (isOpen ? Palette.warning : Palette.success) + '22' }]}>
            <Text style={[gc.badgeText, { color: isOpen ? Palette.warning : Palette.success }]}>
              {isOpen ? 'Open' : 'Confirmed'}
            </Text>
          </View>
        </View>
        <Text style={gc.opponent} numberOfLines={1}>{item.opponent}</Text>
        <Text style={gc.meta}>🏓 {item.court}</Text>
        <Text style={gc.meta}>📅 {item.date} · 🕐 {item.time}</Text>
      </View>
      <Text style={gc.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const gc = StyleSheet.create({
  card:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, overflow: 'hidden' },
  accent:   { width: 4, alignSelf: 'stretch' },
  body:     { flex: 1, padding: Spacing.md },
  topRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  type:     { fontSize: 11, fontWeight: '700', color: Palette.grey500, textTransform: 'uppercase', letterSpacing: 0.5 },
  badge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText:{ fontSize: 10, fontWeight: '700' },
  opponent: { fontSize: 15, fontWeight: '700', color: Palette.grey900 },
  meta:     { fontSize: 12, color: Palette.grey600, marginTop: 2 },
  chevron:  { fontSize: 22, color: Palette.grey400, paddingRight: Spacing.sm },
});

// ─── Nearby court card ────────────────────────────────────────────────────────
function CourtCard({ item, onPress }: { item: typeof NEARBY_COURTS[0]; onPress: () => void }) {
  const typeColors: Record<string, string> = { Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24' };
  const tc = typeColors[item.type] ?? Palette.primary;
  return (
    <TouchableOpacity style={cc.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.name}>
      <View style={cc.img}>
        <Text style={cc.emoji}>🏓</Text>
        <View style={[cc.typeBadge, { backgroundColor: tc + '33' }]}>
          <Text style={[cc.typeText, { color: tc }]}>{item.type}</Text>
        </View>
      </View>
      <View style={cc.body}>
        <Text style={cc.name} numberOfLines={1}>{item.name}</Text>
        <Text style={cc.dist}>📍 {item.dist} away</Text>
        <View style={cc.metaRow}>
          <Text style={cc.rating}>⭐ {item.rating}</Text>
          <Text style={cc.slots}>{item.slots} free</Text>
        </View>
        <Text style={cc.price}>₱{item.price}/hr</Text>
      </View>
    </TouchableOpacity>
  );
}
const cc = StyleSheet.create({
  card:      { width: 160, backgroundColor: '#fff', borderRadius: Radius.md, marginRight: Spacing.sm, overflow: 'hidden' },
  img:       { height: 100, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji:     { fontSize: 44 },
  typeBadge: { position: 'absolute', bottom: 6, right: 6, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  typeText:  { fontSize: 9, fontWeight: '800' },
  body:      { padding: Spacing.sm },
  name:      { fontSize: 12, fontWeight: '700', color: Palette.grey900 },
  dist:      { fontSize: 11, color: Palette.grey500, marginTop: 2 },
  metaRow:   { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  rating:    { fontSize: 11, color: Palette.grey700 },
  slots:     { fontSize: 11, color: Palette.success, fontWeight: '600' },
  price:     { fontSize: 13, fontWeight: '800', color: Palette.primary, marginTop: 4 },
});

// ─── Announcement card ────────────────────────────────────────────────────────
function AnnouncementCard({ item }: { item: typeof ANNOUNCEMENTS[0] }) {
  return (
    <View style={[ac.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
      <View style={ac.topRow}>
        <View style={[ac.tagBadge, { backgroundColor: item.color + '22' }]}>
          <Text style={[ac.tagText, { color: item.color }]}>{item.tag}</Text>
        </View>
        <Text style={ac.date}>{item.date}</Text>
      </View>
      <Text style={ac.title}>{item.title}</Text>
      <Text style={ac.body} numberOfLines={2}>{item.body}</Text>
    </View>
  );
}
const ac = StyleSheet.create({
  card:     { backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md },
  topRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  tagText:  { fontSize: 11, fontWeight: '700' },
  date:     { fontSize: 11, color: Palette.grey400 },
  title:    { fontSize: 14, fontWeight: '800', color: Palette.grey900, marginBottom: 4 },
  body:     { fontSize: 13, color: Palette.grey600, lineHeight: 18 },
});

// ─── Main Home Screen ─────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router  = useRouter();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/notifications')}
              accessibilityLabel="Notifications"
            >
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityLabel="Profile"
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search bar ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/courts')}
          accessibilityRole="button"
          accessibilityLabel="Search courts and players"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search courts, players, tournaments…</Text>
        </TouchableOpacity>

        {/* ── Player Stats ── */}
        <SectionHeader title="Your Stats" onSeeAll={() => router.push('/(tabs)/profile')} />
        <PlayerStats />

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

        {/* ── Upcoming Games ── */}
        <SectionHeader title="Upcoming Games" onSeeAll={() => router.push('/(tabs)/matches')} />
        {UPCOMING_GAMES.map((g) => (
          <GameCard
            key={g.id}
            item={g}
            onPress={() => router.push('/(tabs)/matches')}
          />
        ))}

        {/* ── Nearby Courts ── */}
        <SectionHeader title="Nearby Courts" onSeeAll={() => router.push('/(tabs)/courts')} />
        <FlatList
          horizontal
          data={NEARBY_COURTS}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearbyCourts}
          renderItem={({ item }) => (
            <CourtCard
              item={item}
              onPress={() => router.push(`/courts/${item.id}` as any)}
            />
          )}
        />

        {/* ── Announcements ── */}
        <SectionHeader title="Announcements" />
        {ANNOUNCEMENTS.map((a) => <AnnouncementCard key={a.id} item={a} />)}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Palette.grey100 },
  content: { paddingBottom: Spacing.xl },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  headerLeft:  {},
  greeting:    { fontSize: 13, color: Palette.grey500 },
  userName:    { fontSize: 24, fontWeight: '900', color: Palette.grey900, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  notifBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifIcon: { fontSize: 18 },
  notifDot:  { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.danger, borderWidth: 2, borderColor: '#fff' },

  avatarWrap: { position: 'relative' },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:  { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: Palette.success, borderWidth: 2, borderColor: '#fff' },

  // Search
  searchBar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 13 },
  searchIcon:        { fontSize: 16, marginRight: Spacing.sm },
  searchPlaceholder: { fontSize: 14, color: Palette.grey400, flex: 1 },

  // Quick actions — 3-column grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:   { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 3, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, alignItems: 'center', gap: 6 },
  actionIcon:  { fontSize: 26 },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },

  // Nearby courts horizontal list
  nearbyCourts: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },
});
