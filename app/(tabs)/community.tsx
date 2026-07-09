import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CommunityTab = 'feed' | 'tournaments' | 'clubs' | 'players';

const FEED = [
  { id: '1', user: 'Maria Santos',   avatar: 'MS', time: '2h ago',  text: 'Just won my first tournament at Downtown Center! 🏆 What a match against Pedro. Thanks for the great game!', likes: 24, comments: 6  },
  { id: '2', user: 'Pedro Reyes',    avatar: 'PR', time: '4h ago',  text: 'Looking for a doubles partner for Saturday 9 AM at Riverside Courts. Intermediate level. DM me!',           likes: 8,  comments: 12 },
  { id: '3', user: 'Ana Gonzales',   avatar: 'AG', time: '1d ago',  text: 'New personal best — 11-point winning streak in singles! Hard work paying off 💪 #pickleball',               likes: 41, comments: 9  },
  { id: '4', user: 'Jose Rizal',     avatar: 'JR', time: '2d ago',  text: 'Northpark Arena just installed new net systems. Courts feel amazing now. Highly recommend!',                likes: 17, comments: 3  },
];

const TOURNAMENTS = [
  { id: '1', name: 'Summer Pickleball Open 2026', date: 'Jul 20–22', courts: 'Northpark Arena',   players: '64', status: 'open',       prize: '₱50,000' },
  { id: '2', name: 'Metro Manila Singles Cup',    date: 'Aug 5',     courts: 'Downtown Center',   players: '32', status: 'open',       prize: '₱20,000' },
  { id: '3', name: 'BGC Doubles Classic',         date: 'Aug 15–16', courts: 'BGC Courts',        players: '32', status: 'upcoming',   prize: '₱30,000' },
  { id: '4', name: 'Bayview Beach Open',          date: 'Jul 12',    courts: 'Bayview Courts',    players: '16', status: 'completed',  prize: '₱10,000' },
];

const CLUBS = [
  { id: '1', name: 'Manila Picklers',      members: 128, level: 'All Levels',   emoji: '🏓' },
  { id: '2', name: 'BGC Smash Squad',      members: 64,  level: 'Intermediate', emoji: '⚡' },
  { id: '3', name: 'Northside Ballers',    members: 45,  level: 'Advanced',     emoji: '🎯' },
  { id: '4', name: 'Bayview Beginners',    members: 92,  level: 'Beginner',     emoji: '🌊' },
];

const PLAYERS = [
  { id: '1', name: 'Maria Santos',   rating: 4.8, wins: 38, rank: '#1',  badge: '🥇' },
  { id: '2', name: 'Pedro Reyes',    rating: 4.6, wins: 30, rank: '#2',  badge: '🥈' },
  { id: '3', name: 'Ana Gonzales',   rating: 4.4, wins: 25, rank: '#3',  badge: '🥉' },
  { id: '4', name: 'Jose Rizal',     rating: 4.3, wins: 22, rank: '#4',  badge: '⭐' },
  { id: '5', name: 'Juan dela Cruz', rating: 4.2, wins: 24, rank: '#5',  badge: '⭐' },
];

const TABS: { key: CommunityTab; label: string }[] = [
  { key: 'feed',        label: 'Feed'        },
  { key: 'tournaments', label: 'Tournaments' },
  { key: 'clubs',       label: 'Clubs'       },
  { key: 'players',     label: 'Leaderboard' },
];

const T_STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  open:      { bg: '#34D399' + '22', text: '#27AE60', label: 'Open'      },
  upcoming:  { bg: '#60A5FA' + '22', text: '#1A8FE3', label: 'Upcoming'  },
  completed: { bg: '#9CA3AF' + '22', text: '#6B7280', label: 'Completed' },
};

export default function CommunityScreen() {
  const [tab, setTab] = useState<CommunityTab>('feed');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        {tab === 'feed' && (
          <TouchableOpacity style={styles.postBtn} accessibilityRole="button" accessibilityLabel="Create post">
            <Text style={styles.postBtnText}>✏️ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
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
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── Feed ── */}
        {tab === 'feed' && FEED.map((p) => (
          <View key={p.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAvatar}>
                <Text style={styles.postAvatarText}>{p.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postUser}>{p.user}</Text>
                <Text style={styles.postTime}>{p.time}</Text>
              </View>
              <TouchableOpacity accessibilityLabel="More options"><Text style={styles.postMore}>•••</Text></TouchableOpacity>
            </View>
            <Text style={styles.postText}>{p.text}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction} accessibilityLabel={`${p.likes} likes`}>
                <Text style={styles.postActionIcon}>❤️</Text>
                <Text style={styles.postActionCount}>{p.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction} accessibilityLabel={`${p.comments} comments`}>
                <Text style={styles.postActionIcon}>💬</Text>
                <Text style={styles.postActionCount}>{p.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction} accessibilityLabel="Share">
                <Text style={styles.postActionIcon}>↗️</Text>
                <Text style={styles.postActionCount}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── Tournaments ── */}
        {tab === 'tournaments' && TOURNAMENTS.map((t) => {
          const s = T_STATUS_STYLE[t.status];
          return (
            <View key={t.id} style={styles.tCard}>
              <View style={styles.tHeader}>
                <Text style={styles.tName}>{t.name}</Text>
                <View style={[styles.tBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.tBadgeText, { color: s.text }]}>{s.label}</Text>
                </View>
              </View>
              <Text style={styles.tMeta}>📅 {t.date}</Text>
              <Text style={styles.tMeta}>🏓 {t.courts}</Text>
              <View style={styles.tFooter}>
                <View style={styles.tStat}><Text style={styles.tStatValue}>{t.players}</Text><Text style={styles.tStatLabel}>Players</Text></View>
                <View style={styles.tStat}><Text style={[styles.tStatValue, { color: '#27AE60' }]}>{t.prize}</Text><Text style={styles.tStatLabel}>Prize</Text></View>
                {t.status !== 'completed' && (
                  <TouchableOpacity style={styles.tRegBtn} accessibilityRole="button" accessibilityLabel={`Register for ${t.name}`}>
                    <Text style={styles.tRegText}>Register</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* ── Clubs ── */}
        {tab === 'clubs' && (
          <>
            <TouchableOpacity style={styles.createClubBtn} accessibilityRole="button" accessibilityLabel="Create a club">
              <Text style={styles.createClubText}>+ Create a Club</Text>
            </TouchableOpacity>
            {CLUBS.map((c) => (
              <View key={c.id} style={styles.clubCard}>
                <View style={styles.clubEmoji}><Text style={{ fontSize: 30 }}>{c.emoji}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubName}>{c.name}</Text>
                  <Text style={styles.clubMeta}>{c.members} members · {c.level}</Text>
                </View>
                <TouchableOpacity style={styles.joinClubBtn} accessibilityRole="button" accessibilityLabel={`Join ${c.name}`}>
                  <Text style={styles.joinClubText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ── Leaderboard ── */}
        {tab === 'players' && (
          <>
            <View style={styles.lbHeader}>
              <Text style={styles.lbTitle}>🏆 Top Players</Text>
              <Text style={styles.lbSub}>Updated weekly</Text>
            </View>
            {PLAYERS.map((p, i) => (
              <View key={p.id} style={[styles.lbRow, i === 0 && styles.lbRowFirst]}>
                <Text style={styles.lbRank}>{p.rank}</Text>
                <View style={[styles.lbAvatar, i === 0 && styles.lbAvatarFirst]}>
                  <Text style={styles.lbAvatarText}>{p.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lbName, i === 0 && { color: '#F39C12' }]}>{p.name}</Text>
                  <Text style={styles.lbWins}>{p.wins} wins</Text>
                </View>
                <Text style={styles.lbBadge}>{p.badge}</Text>
                <Text style={styles.lbRating}>⭐ {p.rating}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Palette.grey100 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  title:         { fontSize: 22, fontWeight: '900', color: Palette.grey900 },
  postBtn:       { backgroundColor: Palette.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full },
  postBtnText:   { color: Palette.primary, fontWeight: '700', fontSize: 13 },
  tabScroll:     { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200, maxHeight: 46 },
  tabContent:    { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  tabBtn:        { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:  { borderBottomColor: Palette.primary },
  tabText:       { fontSize: 13, color: Palette.grey500, fontWeight: '500' },
  tabTextActive: { color: Palette.primary, fontWeight: '700' },
  body:          { padding: Spacing.md, gap: Spacing.sm },

  // Feed
  postCard:       { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, ...shadowSm },
  postHeader:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  postAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  postUser:       { fontSize: 14, fontWeight: '700', color: Palette.grey900 },
  postTime:       { fontSize: 11, color: Palette.grey400 },
  postMore:       { fontSize: 16, color: Palette.grey400, paddingHorizontal: 4 },
  postText:       { fontSize: 14, color: Palette.grey700, lineHeight: 20, marginBottom: Spacing.sm },
  postActions:    { flexDirection: 'row', gap: Spacing.lg, borderTopWidth: 1, borderTopColor: Palette.grey100, paddingTop: Spacing.sm },
  postAction:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionIcon: { fontSize: 15 },
  postActionCount:{ fontSize: 12, color: Palette.grey600, fontWeight: '600' },

  // Tournaments
  tCard:       { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, ...shadowSm },
  tHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  tName:       { fontSize: 15, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: Spacing.sm },
  tBadge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  tBadgeText:  { fontSize: 11, fontWeight: '700' },
  tMeta:       { fontSize: 13, color: Palette.grey600, marginBottom: 2 },
  tFooter:     { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md },
  tStat:       { alignItems: 'center' },
  tStatValue:  { fontSize: 15, fontWeight: '800', color: Palette.grey900 },
  tStatLabel:  { fontSize: 10, color: Palette.grey500 },
  tRegBtn:     { marginLeft: 'auto' as any, backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  tRegText:    { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Clubs
  createClubBtn: { backgroundColor: Palette.primaryLight, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Palette.primary, borderStyle: 'dashed' },
  createClubText:{ color: Palette.primary, fontWeight: '700', fontSize: 14 },
  clubCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md, ...shadowSm },
  clubEmoji:     { width: 52, height: 52, borderRadius: 26, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  clubName:      { fontSize: 15, fontWeight: '700', color: Palette.grey900 },
  clubMeta:      { fontSize: 12, color: Palette.grey600, marginTop: 2 },
  joinClubBtn:   { backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  joinClubText:  { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Leaderboard
  lbHeader:      { marginBottom: Spacing.sm },
  lbTitle:       { fontSize: 18, fontWeight: '800', color: Palette.grey900 },
  lbSub:         { fontSize: 12, color: Palette.grey500, marginTop: 2 },
  lbRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, ...shadowSm },
  lbRowFirst:    { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#F39C12' + '55' },
  lbRank:        { fontSize: 14, fontWeight: '800', color: Palette.grey500, width: 32 },
  lbAvatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  lbAvatarFirst: { backgroundColor: '#F39C12' },
  lbAvatarText:  { color: '#fff', fontWeight: '800', fontSize: 13 },
  lbName:        { fontSize: 14, fontWeight: '700', color: Palette.grey900 },
  lbWins:        { fontSize: 11, color: Palette.grey500, marginTop: 1 },
  lbBadge:       { fontSize: 18 },
  lbRating:      { fontSize: 13, fontWeight: '700', color: Palette.grey700 },
});
