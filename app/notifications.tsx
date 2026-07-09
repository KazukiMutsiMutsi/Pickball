import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
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

interface Notif {
  id: string;
  type: 'booking' | 'reminder' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ICONS: Record<string, string> = {
  booking: '📅',
  reminder: '⏰',
  promo: '🎉',
  system: 'ℹ️',
};

const MOCK: Notif[] = [
  { id: '1', type: 'booking',  title: 'Booking Confirmed',  message: 'Your court at Downtown Pickleball Center is confirmed for July 12 at 9:00 AM.', time: '2h ago',  read: false },
  { id: '2', type: 'reminder', title: 'Upcoming Session',   message: "Your session at Riverside Courts starts in 1 hour. Don't forget your paddle!",  time: '5h ago',  read: false },
  { id: '3', type: 'promo',    title: 'Weekend Special 🎉', message: 'Book any court this Saturday or Sunday and get 20% off. Use code WEEKEND20.',      time: '1d ago',  read: true  },
  { id: '4', type: 'booking',  title: 'Booking Cancelled',  message: 'Your booking at Northpark Arena on June 15 was cancelled. Refund processing.',    time: '3d ago',  read: true  },
  { id: '5', type: 'system',   title: 'App Update Available',message: 'A new version of PicklePro is available with improved booking features.',         time: '1w ago',  read: true  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(MOCK);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Read all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => markRead(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{ICONS[item.type]}</Text>
            </View>
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Palette.grey100 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:         { width: 40 },
  backIcon:        { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:           { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  markAllBtn:      { width: 60, alignItems: 'flex-end' },
  markAllText:     { fontSize: 13, color: Palette.primary, fontWeight: '600' },
  list:            { padding: Spacing.md, gap: Spacing.sm },
  empty:           { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:      { fontSize: 48 },
  emptyText:       { fontSize: 15, color: Palette.grey500, marginTop: Spacing.sm },
  card:            { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, ...shadowSm },
  cardUnread:      { borderLeftWidth: 3, borderLeftColor: Palette.primary },
  iconWrap:        { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  icon:            { fontSize: 18 },
  content:         { flex: 1 },
  contentHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle:       { fontSize: 14, fontWeight: '600', color: Palette.grey700, flex: 1, marginRight: 8 },
  cardTitleUnread: { color: Palette.grey900, fontWeight: '700' },
  time:            { fontSize: 11, color: Palette.grey500 },
  message:         { fontSize: 13, color: Palette.grey600, lineHeight: 18 },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.primary, marginLeft: 6, marginTop: 4 },
});
