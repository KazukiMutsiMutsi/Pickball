import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuthContext } from '@/src/context/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { bookingsService } from '@/src/services/bookings.service';
import { shadowMd } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FFF7ED', text: '#D97706' },
  confirmed: { bg: '#E8F4FD', text: Palette.primary },
  completed: { bg: '#E8F8EF', text: Palette.success },
  cancelled: { bg: '#FDECEA', text: Palette.danger  },
};

function to12h(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function BookingHistoryScreen() {
  const router      = useRouter();
  const { user }    = useAuthContext();
  const { bookings, loading, refresh } = useBookings();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  const handleCancel = (id: string, ref: string) => {
    Alert.alert(
      'Cancel Booking',
      `Cancel booking ${ref}? This cannot be undone.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            if (!user?.token) return;
            setCancelling(id);
            try {
              await bookingsService.cancel(id, user.token);
              refresh();
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Could not cancel.');
            } finally {
              setCancelling(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && bookings.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎾</Text>
              <Text style={styles.emptyText}>No bookings here yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const colors   = STATUS_COLOR[item.status] ?? STATUS_COLOR['pending'];
            const courtName = (item.courts as { display_name?: string } | undefined)?.display_name
              ?? item.court_id;

            return (
              <View style={[styles.card, shadowMd]}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.courtName} numberOfLines={1}>{courtName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Meta */}
                <View style={styles.cardMeta}>
                  <Text style={styles.metaItem}>📅 {formatDate(item.date)}</Text>
                  <Text style={styles.metaItem}>
                    🕐 {to12h(item.start_slot)} – {to12h(item.end_slot)}
                  </Text>
                  <Text style={styles.metaItem}>
                    ⏱ {item.duration_hours} hr{item.duration_hours !== 1 ? 's' : ''}
                    {'  ·  '}👥 {item.players} player{item.players !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.bookingId}>{item.booking_ref}</Text>
                  <Text style={styles.totalAmount}>₱{item.total_amount.toFixed(2)}</Text>
                </View>

                {/* Actions */}
                {(item.status === 'pending' || item.status === 'confirmed') && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelBtn,
                        cancelling === item.id && { opacity: 0.5 }]}
                      onPress={() => handleCancel(item.id, item.booking_ref)}
                      disabled={cancelling === item.id}
                      accessibilityRole="button"
                    >
                      {cancelling === item.id
                        ? <ActivityIndicator size="small" color={Palette.danger} />
                        : <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Cancel</Text>
                      }
                    </TouchableOpacity>

                    {item.status === 'confirmed' && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push({
                          pathname: '/booking/qr-ticket',
                          params: {
                            bookingId:     item.booking_ref,
                            courtName,
                            date:          item.date,
                            startTime:     item.start_slot,
                            endTime:       item.end_slot,
                            duration:      String(item.duration_hours),
                            grandTotal:    String(item.total_amount),
                            paymentMethod: item.payment_method,
                            bookingDbId:   item.id,
                          },
                        })}
                        accessibilityRole="button"
                      >
                        <Text style={styles.actionBtnText}>QR Ticket</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {item.status === 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rebookBtn]}
                    onPress={() => router.push('/courts')}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.actionBtnText, { color: Palette.primary }]}>Book Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Palette.grey100 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:       { width: 40 },
  backIcon:      { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:         { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  tabs:          { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  tab:           { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: Palette.primary },
  tabText:       { fontSize: 12, color: Palette.grey500, fontWeight: '500' },
  tabTextActive: { color: Palette.primary, fontWeight: '700' },
  list:          { padding: Spacing.md, gap: Spacing.sm },
  empty:         { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji:    { fontSize: 40 },
  emptyText:     { fontSize: 15, color: Palette.grey500 },
  card:          { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  courtName:     { fontSize: 15, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 8 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  statusText:    { fontSize: 12, fontWeight: '700' },
  cardMeta:      { gap: 4, marginBottom: Spacing.sm },
  metaItem:      { fontSize: 13, color: Palette.grey600 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Palette.grey200, paddingTop: Spacing.sm },
  bookingId:     { fontSize: 11, color: Palette.grey500 },
  totalAmount:   { fontSize: 16, fontWeight: '800', color: Palette.grey900 },
  actionRow:     { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn:     { flex: 1, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 9, alignItems: 'center' },
  actionBtnText: { fontSize: 13, color: Palette.primary, fontWeight: '600' },
  cancelBtn:     { borderColor: Palette.danger },
  cancelBtnText: { color: Palette.danger },
  rebookBtn:     { marginTop: Spacing.sm, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 9, alignItems: 'center' },
});
