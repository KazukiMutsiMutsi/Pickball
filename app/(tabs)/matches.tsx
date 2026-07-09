import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MatchTab = 'upcoming' | 'open' | 'past';

const MATCHES = {
  upcoming: [
    { id: '1', type: 'Singles',  opponent: 'Maria Santos',   court: 'Downtown Center',  date: 'Today',    time: '6:00 PM', skill: 'Intermediate' },
    { id: '2', type: 'Doubles',  opponent: 'Pedro & Ana',    court: 'Riverside Courts', date: 'Tomorrow', time: '9:00 AM', skill: 'Advanced'     },
  ],
  open: [
    { id: '3', type: 'Open Game',    opponent: '3 players joined', court: 'Sunset Pavilion',  date: 'Jul 15', time: '7:00 PM', skill: 'All Levels'   },
    { id: '4', type: 'Open Doubles', opponent: '1 player joined',  court: 'Bayview Courts',   date: 'Jul 16', time: '8:00 AM', skill: 'Beginner'     },
    { id: '5', type: 'Tournament',   opponent: '16 players',       court: 'Northpark Arena',  date: 'Jul 20', time: '9:00 AM', skill: 'Intermediate' },
  ],
  past: [
    { id: '6', type: 'Singles', opponent: 'Jose Rizal',    court: 'Downtown Center',  date: 'Jul 5', time: '5:00 PM', result: 'W 11-7, 11-4'  },
    { id: '7', type: 'Doubles', opponent: 'Team Santos',   court: 'Riverside Courts', date: 'Jul 1', time: '9:00 AM', result: 'L 9-11, 11-8, 8-11' },
    { id: '8', type: 'Singles', opponent: 'Ana Gonzales',  court: 'Sunset Pavilion',  date: 'Jun 28',time: '6:00 PM', result: 'W 11-5, 11-9'  },
  ],
};

const SKILL_COLOR: Record<string, string> = {
  'All Levels': '#9CA3AF', Beginner: '#34D399', Intermediate: '#60A5FA',
  Advanced: '#F472B6', Expert: '#F87171',
};

const TABS: { key: MatchTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'open',     label: 'Open Games' },
  { key: 'past',     label: 'History' },
];

export default function MatchesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<MatchTab>('upcoming');

  const data = MATCHES[tab];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <TouchableOpacity style={styles.createBtn} accessibilityRole="button" accessibilityLabel="Create a match">
          <Text style={styles.createBtnText}>+ Create</Text>
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

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Create match CTA for open tab */}
        {tab === 'open' && (
          <View style={styles.joinBanner}>
            <Text style={styles.joinBannerEmoji}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.joinBannerTitle}>Find players near you</Text>
              <Text style={styles.joinBannerSub}>Join open games or create one and invite others</Text>
            </View>
            <TouchableOpacity style={styles.joinBannerBtn} accessibilityRole="button" accessibilityLabel="Join a game">
              <Text style={styles.joinBannerBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}

        {data.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎾</Text>
            <Text style={styles.emptyText}>No matches here yet.</Text>
          </View>
        )}

        {data.map((m: any) => (
          <TouchableOpacity key={m.id} style={styles.card} accessibilityRole="button" accessibilityLabel={`Match against ${m.opponent}`}>
            {/* Type pill */}
            <View style={styles.cardTop}>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{m.type}</Text>
              </View>
              {m.skill && (
                <View style={[styles.skillPill, { backgroundColor: (SKILL_COLOR[m.skill] ?? '#9CA3AF') + '22' }]}>
                  <Text style={[styles.skillText, { color: SKILL_COLOR[m.skill] ?? '#9CA3AF' }]}>{m.skill}</Text>
                </View>
              )}
              {m.result && (
                <View style={[styles.resultPill, { backgroundColor: m.result.startsWith('W') ? '#34D399' + '22' : '#F87171' + '22' }]}>
                  <Text style={[styles.resultText, { color: m.result.startsWith('W') ? '#27AE60' : '#E74C3C' }]}>{m.result}</Text>
                </View>
              )}
            </View>
            <Text style={styles.opponent}>{m.opponent}</Text>
            <Text style={styles.meta}>🏓 {m.court}</Text>
            <Text style={styles.meta}>📅 {m.date} · 🕐 {m.time}</Text>
            {tab !== 'past' && (
              <View style={styles.cardActions}>
                {tab === 'open' && (
                  <TouchableOpacity style={styles.joinBtn} accessibilityRole="button" accessibilityLabel="Join match">
                    <Text style={styles.joinBtnText}>Join Match</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.viewBtn} accessibilityRole="button" accessibilityLabel="View details">
                  <Text style={styles.viewBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Palette.grey100 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  title:          { fontSize: 22, fontWeight: '900', color: Palette.grey900 },
  createBtn:      { backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  createBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabRow:         { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  tabBtn:         { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:   { borderBottomColor: Palette.primary },
  tabText:        { fontSize: 13, color: Palette.grey500, fontWeight: '500' },
  tabTextActive:  { color: Palette.primary, fontWeight: '700' },
  body:           { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },

  joinBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  joinBannerEmoji:{ fontSize: 28 },
  joinBannerTitle:{ fontSize: 14, fontWeight: '700', color: Palette.grey900 },
  joinBannerSub:  { fontSize: 12, color: Palette.grey600, marginTop: 2 },
  joinBannerBtn:  { backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  joinBannerBtnText:{ color: '#fff', fontWeight: '700', fontSize: 13 },

  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { fontSize: 15, color: Palette.grey500, marginTop: Spacing.sm },

  card:         { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, ...shadowSm },
  cardTop:      { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  typePill:     { backgroundColor: Palette.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  typePillText: { fontSize: 11, fontWeight: '700', color: Palette.primary },
  skillPill:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  skillText:    { fontSize: 11, fontWeight: '600' },
  resultPill:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  resultText:   { fontSize: 11, fontWeight: '700' },
  opponent:     { fontSize: 16, fontWeight: '700', color: Palette.grey900 },
  meta:         { fontSize: 12, color: Palette.grey600, marginTop: 2 },
  cardActions:  { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  joinBtn:      { flex: 1, backgroundColor: Palette.primary, borderRadius: Radius.sm, paddingVertical: 9, alignItems: 'center' },
  joinBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  viewBtn:      { flex: 1, backgroundColor: Palette.primaryLight, borderRadius: Radius.sm, paddingVertical: 9, alignItems: 'center' },
  viewBtnText:  { color: Palette.primary, fontWeight: '600', fontSize: 13 },
});
