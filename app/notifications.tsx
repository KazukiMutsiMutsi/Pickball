import { Palette, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL: Notif[] = [
  {
    id: '1',
    title: 'Thank you for choosing PicklePro',
    message: 'Thank you for choosing PicklePro. We are glad to have you here — book a court and enjoy the game!',
    time: 'Just now',
    read: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = (id: string) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Notifications{unread > 0 ? ` (${unread})` : ''}</Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={s.readAllBtn}>
            <Text style={s.readAllText}>Read all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Text style={s.emptyText}>No notifications</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, !item.read && s.cardUnread]}
            onPress={() => markRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={s.body}>
              <View style={s.row}>
                <Text style={[s.cardTitle, !item.read && s.cardTitleUnread]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={s.time}>{item.time}</Text>
              </View>
              <Text style={s.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={s.dot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F8FAFC' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn:       { width: 40 },
  backIcon:      { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:         { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  readAllBtn:    { width: 60, alignItems: 'flex-end' },
  readAllText:   { fontSize: 13, color: Palette.primary, fontWeight: '600' },
  list:          { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  empty:         { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText:     { fontSize: 15, color: '#64748B' },
  card:          { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardUnread:    { borderLeftWidth: 3, borderLeftColor: Palette.primary, backgroundColor: '#F8FBFF' },
  body:          { flex: 1 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 6 },
  cardTitle:     { fontSize: 14, fontWeight: '600', color: '#64748B', flex: 1 },
  cardTitleUnread: { color: '#0F172A', fontWeight: '700' },
  time:          { fontSize: 11, color: '#94A3B8', flexShrink: 0 },
  message:       { fontSize: 13, color: '#64748B', lineHeight: 18 },
  dot:           { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.primary, marginTop: 4, flexShrink: 0 },
});
