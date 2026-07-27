import { Palette, Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const TYPE_COLOR: Record<string, string> = {
  success: '#16A34A',
  warning: '#D97706',
  error:   '#DC2626',
  info:    Palette.primary,
};

export default function NotificationsTab() {
  const router = useRouter();
  const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useNotifications();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={s.readAllBtn}>
            <Text style={s.readAllText}>Read all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          onRefresh={refresh}
          refreshing={loading}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔔</Text>
              <Text style={s.emptyText}>No notifications yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, !item.is_read && s.cardUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.7}
            >
              {/* colour strip by type */}
              <View style={[s.typeStrip, { backgroundColor: TYPE_COLOR[item.type] ?? Palette.primary }]} />
              <View style={s.body}>
                <View style={s.row}>
                  <Text style={[s.cardTitle, !item.is_read && s.cardTitleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={s.time}>{timeAgo(item.created_at)}</Text>
                </View>
                <Text style={s.message} numberOfLines={3}>{item.message}</Text>
              </View>
              {!item.is_read && <View style={s.dot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#F8FAFC' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn:         { width: 40 },
  backText:        { fontSize: 14, color: Palette.primary, fontWeight: '700' },
  title:           { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  readAllBtn:      { width: 60, alignItems: 'flex-end' },
  readAllText:     { fontSize: 13, color: Palette.primary, fontWeight: '600' },
  list:            { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  empty:           { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji:      { fontSize: 40 },
  emptyText:       { fontSize: 15, color: '#64748B' },
  card:            { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: Radius.md, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardUnread:      { backgroundColor: '#F8FBFF' },
  typeStrip:       { width: 4, alignSelf: 'stretch' },
  body:            { flex: 1, padding: Spacing.md },
  row:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 6 },
  cardTitle:       { fontSize: 14, fontWeight: '600', color: '#64748B', flex: 1 },
  cardTitleUnread: { color: '#0F172A', fontWeight: '700' },
  time:            { fontSize: 11, color: '#94A3B8', flexShrink: 0 },
  message:         { fontSize: 13, color: '#64748B', lineHeight: 18 },
  dot:             { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.primary, marginTop: Spacing.md, marginRight: Spacing.sm, flexShrink: 0 },
});
