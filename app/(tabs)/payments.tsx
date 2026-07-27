import { Palette, Spacing } from '@/constants/theme';
import { useAuthContext } from '@/src/context/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { paymentService } from '@/src/services/payment.service';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PayTab = 'pending' | 'history';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function to12h(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ─── Payments Screen ──────────────────────────────────────────────────────────
export default function PaymentsTab() {
  const { user }   = useAuthContext();
  const { bookings, loading, refresh } = useBookings();
  const [tab, setTab] = useState<PayTab>('pending');
  const [paying, setPaying] = useState<string | null>(null);

  // Split bookings into pending (needs payment) and history (completed/cancelled)
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const historyBookings = bookings.filter(b => b.status !== 'pending');

  const totalPending = pendingBookings.reduce(
    (sum, b) => sum + Number(b.total_amount), 0,
  );

  const handlePayGcash = async (bookingId: string) => {
    if (!user?.token) return;
    setPaying(bookingId);
    try {
      const result = await paymentService.createGcashLink(bookingId, user.token);
      await WebBrowser.openBrowserAsync(result.checkoutUrl);
      // Refresh after returning from browser
      refresh();
    } catch (err: unknown) {
      Alert.alert('Payment Error', err instanceof Error ? err.message : 'Could not start payment.');
    } finally {
      setPaying(null);
    }
  };

  const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: '#E8F4FD', text: Palette.primary },
    completed: { bg: '#E8F8EF', text: '#16A34A'       },
    cancelled: { bg: '#FDECEA', text: '#DC2626'        },
    pending:   { bg: '#FFF7ED', text: '#D97706'        },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[Palette.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
        </View>

        {/* Summary card */}
        <View style={[styles.summaryCard, shadowMd]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Pending Payment</Text>
              <Text style={styles.summaryAmount}>
                {loading ? '—' : `₱${totalPending.toFixed(2)}`}
              </Text>
            </View>
            {pendingBookings.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  {pendingBookings.length} pending
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['pending', 'history'] as PayTab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'pending' ? `Pending${pendingBookings.length > 0 ? ` (${pendingBookings.length})` : ''}` : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Pending tab ── */}
        {tab === 'pending' && (
          <View style={styles.section}>
            {loading && pendingBookings.length === 0 ? (
              <ActivityIndicator color={Palette.primary} style={{ marginTop: 40 }} />
            ) : pendingBookings.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>✅</Text>
                <Text style={styles.emptyTitle}>All paid up!</Text>
                <Text style={styles.emptySub}>No pending payments</Text>
              </View>
            ) : (
              pendingBookings.map(b => {
                const courtName = (b.courts as { display_name?: string } | undefined)
                  ?.display_name ?? b.court_id;
                const isPayingThis = paying === b.id;
                return (
                  <View key={b.id} style={[styles.pendingCard, shadowSm]}>
                    <View style={styles.pendingTop}>
                      <Text style={styles.pendingCourt}>{courtName}</Text>
                      <Text style={styles.pendingAmount}>₱{Number(b.total_amount).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.pendingMeta}>
                      {formatDate(b.date)}  ·  {to12h(b.start_slot)} – {to12h(b.end_slot)}
                    </Text>
                    <Text style={styles.pendingId}>{b.booking_ref}</Text>

                    {/* Pay via GCash button */}
                    <TouchableOpacity
                      style={[styles.payNowBtn, isPayingThis && { opacity: 0.6 }]}
                      onPress={() => handlePayGcash(b.id)}
                      disabled={isPayingThis}
                      accessibilityRole="button"
                    >
                      {isPayingThis
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.payNowBtnText}>Pay via GCash  ₱{Number(b.total_amount).toFixed(2)}</Text>
                      }
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── History tab ── */}
        {tab === 'history' && (
          <View style={styles.section}>
            {loading && historyBookings.length === 0 ? (
              <ActivityIndicator color={Palette.primary} style={{ marginTop: 40 }} />
            ) : historyBookings.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>No payment history yet</Text>
                <Text style={styles.emptySub}>Your completed payments will appear here</Text>
              </View>
            ) : (
              historyBookings.map(b => {
                const courtName = (b.courts as { display_name?: string } | undefined)
                  ?.display_name ?? b.court_id;
                const colors = STATUS_COLOR[b.status] ?? STATUS_COLOR['pending'];
                return (
                  <View key={b.id} style={[styles.historyCard, shadowSm]}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyCourt}>{courtName}</Text>
                      <Text style={[
                        styles.historyAmount,
                        b.status === 'cancelled' && { color: '#DC2626' },
                      ]}>
                        ₱{Number(b.total_amount).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.historyMeta}>
                      {formatDate(b.date)}  ·  {to12h(b.start_slot)} – {to12h(b.end_slot)}
                    </Text>
                    <View style={styles.historyFooter}>
                      <Text style={styles.historyId}>{b.booking_ref}</Text>
                      <View style={[styles.historyBadge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.historyBadgeText, { color: colors.text }]}>
                          {b.status === 'confirmed' ? b.payment_method.toUpperCase()
                            : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#F8FAFC' },
  header:             { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title:              { fontSize: 22, fontWeight: '900', color: '#0F172A' },

  summaryCard:        { margin: Spacing.md, backgroundColor: Palette.primary, borderRadius: 20, padding: Spacing.lg },
  summaryRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel:       { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  summaryAmount:      { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
  pendingBadge:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  pendingBadgeText:   { color: '#fff', fontSize: 12, fontWeight: '700' },

  tabRow:             { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn:             { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:       { borderBottomColor: Palette.primary },
  tabText:            { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive:      { color: Palette.primary, fontWeight: '700' },

  section:            { padding: Spacing.md, gap: Spacing.sm },

  pendingCard:        { backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  pendingTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pendingCourt:       { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  pendingAmount:      { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  pendingMeta:        { fontSize: 13, color: '#64748B' },
  pendingId:          { fontSize: 10, color: '#94A3B8', marginTop: 4, marginBottom: Spacing.sm },
  payNowBtn:          { backgroundColor: '#0070FF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  payNowBtnText:      { color: '#fff', fontWeight: '800', fontSize: 14 },

  empty:              { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyEmoji:         { fontSize: 40 },
  emptyTitle:         { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  emptySub:           { fontSize: 14, color: '#64748B' },

  historyCard:        { backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md },
  historyTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyCourt:       { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  historyAmount:      { fontSize: 16, fontWeight: '800', color: '#10B981' },
  historyMeta:        { fontSize: 12, color: '#64748B', marginBottom: 6 },
  historyFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyId:          { fontSize: 10, color: '#94A3B8' },
  historyBadge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  historyBadgeText:   { fontSize: 11, fontWeight: '700' },
});
