import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATS = [
  { label: 'Rating',  value: '4.2',  icon: '⭐' },
  { label: 'Wins',    value: '24',   icon: '🏆' },
  { label: 'Losses',  value: '8',    icon: '📉' },
  { label: 'Matches', value: '32',   icon: '⚡' },
];

const RECENT_MATCHES = [
  { id: '1', opponent: 'Maria Santos',  result: 'W',  score: '11-7, 11-4',    date: 'Jul 5'  },
  { id: '2', opponent: 'Pedro Reyes',   result: 'L',  score: '9-11, 11-8, 8-11', date: 'Jul 1'},
  { id: '3', opponent: 'Ana Gonzales',  result: 'W',  score: '11-5, 11-9',    date: 'Jun 28' },
];

const BADGES = [
  { icon: '🏆', label: 'First Win'        },
  { icon: '🔥', label: 'Win Streak x5'    },
  { icon: '⚡', label: '10 Matches'       },
  { icon: '📅', label: '5 Bookings'       },
  { icon: '👥', label: 'Community Member' },
  { icon: '⭐', label: 'Top Rated'        },
];

const MENU = [
  { icon: '📋', label: 'Booking History', route: '/booking/history' },
  { icon: '🔔', label: 'Notifications',   route: '/notifications'   },
  { icon: '⚙️', label: 'Settings',        route: '/settings'        },
  { icon: '❓', label: 'Help & Support',  route: null               },
  { icon: '📄', label: 'Terms & Privacy', route: null               },
];

export default function ProfileScreen() {
  const router      = useRouter();
  const { user, logout } = useAuth();
  const initials    = (user?.name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} accessibilityLabel="Change photo">
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Player'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>⭐ Intermediate</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>Rank #5</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} accessibilityRole="button" accessibilityLabel="Edit profile">
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Win rate ── */}
        <View style={styles.winRateCard}>
          <View style={styles.winRateHeader}>
            <Text style={styles.winRateTitle}>Win Rate</Text>
            <Text style={styles.winRatePct}>75%</Text>
          </View>
          <View style={styles.winRateTrack}>
            <View style={[styles.winRateFill, { width: '75%' }]} />
          </View>
          <View style={styles.winRateFooter}>
            <Text style={styles.winRateWins}>✅ 24 Wins</Text>
            <Text style={styles.winRateLosses}>❌ 8 Losses</Text>
          </View>
        </View>

        {/* ── Recent matches ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {RECENT_MATCHES.map((m) => (
            <View key={m.id} style={styles.matchRow}>
              <View style={[styles.resultDot, { backgroundColor: m.result === 'W' ? Palette.success : Palette.danger }]}>
                <Text style={styles.resultText}>{m.result}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchOpponent}>vs {m.opponent}</Text>
                <Text style={styles.matchScore}>{m.score}</Text>
              </View>
              <Text style={styles.matchDate}>{m.date}</Text>
            </View>
          ))}
        </View>

        {/* ── Badges ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((b) => (
              <View key={b.label} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeEmoji}>{b.icon}</Text>
                </View>
                <Text style={styles.badgeLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          {MENU.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx > 0 && styles.menuRowBorder]}
              onPress={() => item.route && router.push(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Sign out">
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.grey100 },

  // Hero
  hero:           { alignItems: 'center', paddingBottom: Spacing.lg, backgroundColor: '#fff', marginBottom: Spacing.sm, overflow: 'hidden' },
  heroBg:         { position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: Palette.primary },
  avatarWrap:     { marginTop: Spacing.xl, position: 'relative' },
  avatar:         { width: 90, height: 90, borderRadius: 45, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarText:     { color: '#fff', fontSize: 30, fontWeight: '900' },
  editAvatarBtn:  { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  editAvatarIcon: { fontSize: 12 },
  userName:       { fontSize: 22, fontWeight: '900', color: Palette.grey900, marginTop: Spacing.sm },
  userEmail:      { fontSize: 13, color: Palette.grey500, marginTop: 2 },
  levelRow:       { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  levelBadge:     { backgroundColor: '#FFF8E1', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  levelText:      { fontSize: 12, color: '#F39C12', fontWeight: '700' },
  rankBadge:      { backgroundColor: Palette.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  rankText:       { fontSize: 12, color: Palette.primary, fontWeight: '700' },
  editProfileBtn: { marginTop: Spacing.md, borderWidth: 1.5, borderColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 9, borderRadius: Radius.full },
  editProfileText:{ color: Palette.primary, fontWeight: '700', fontSize: 13 },

  // Stats
  statsRow:  { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard:  { flex: 1, backgroundColor: '#fff', borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', ...shadowSm },
  statIcon:  { fontSize: 18 },
  statValue: { fontSize: 20, fontWeight: '900', color: Palette.grey900, marginTop: 2 },
  statLabel: { fontSize: 10, color: Palette.grey500, marginTop: 2 },

  // Win rate
  winRateCard:   { backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, padding: Spacing.md, marginBottom: Spacing.sm, ...shadowSm },
  winRateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  winRateTitle:  { fontSize: 14, fontWeight: '700', color: Palette.grey900 },
  winRatePct:    { fontSize: 14, fontWeight: '900', color: Palette.primary },
  winRateTrack:  { height: 8, backgroundColor: Palette.grey200, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm },
  winRateFill:   { height: '100%', backgroundColor: Palette.primary, borderRadius: 4 },
  winRateFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  winRateWins:   { fontSize: 12, color: Palette.success, fontWeight: '600' },
  winRateLosses: { fontSize: 12, color: Palette.danger, fontWeight: '600' },

  // Matches
  section:       { backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md, ...shadowSm },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: Palette.grey900, marginBottom: Spacing.sm },
  matchRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Palette.grey100 },
  resultDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resultText:    { color: '#fff', fontWeight: '900', fontSize: 13 },
  matchOpponent: { fontSize: 13, fontWeight: '700', color: Palette.grey900 },
  matchScore:    { fontSize: 11, color: Palette.grey500, marginTop: 1 },
  matchDate:     { fontSize: 11, color: Palette.grey400 },

  // Badges
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeItem:  { alignItems: 'center', width: '30%' },
  badgeIcon:  { width: 50, height: 50, borderRadius: 25, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeEmoji: { fontSize: 24 },
  badgeLabel: { fontSize: 10, color: Palette.grey600, textAlign: 'center', fontWeight: '600' },

  // Menu
  menuCard:      { backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, overflow: 'hidden', marginBottom: Spacing.sm, ...shadowSm },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 15 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: Palette.grey100 },
  menuIcon:      { fontSize: 18, width: 28 },
  menuLabel:     { flex: 1, fontSize: 15, color: Palette.grey900 },
  menuChevron:   { fontSize: 20, color: Palette.grey400 },

  // Logout
  logoutBtn:  { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Palette.danger, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: Palette.danger, fontSize: 15, fontWeight: '700' },
});
