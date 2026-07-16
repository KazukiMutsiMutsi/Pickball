import { Palette, Spacing } from '@/constants/theme';
import { getAllBookings, StaffBooking, updateBooking } from '@/src/booking/bookingStore';
import { notifyBookingCancelled } from '@/src/notifications/notificationStore';
import { shadowMd } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function to12h(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

type FilterTab = 'all' | 'confirmed' | 'completed' | 'cancelled';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'confirmed', label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  confirmed:  { bg: '#E8F4FD', color: Palette.primary,  label: 'Confirmed'  },
  checked_in: { bg: '#F3E5F5', color: '#8E44AD',         label: 'Checked In' },
  completed:  { bg: '#E8F8EF', color: Palette.success,  label: 'Completed'  },
  cancelled:  { bg: '#FDECEA', color: Palette.danger,   label: 'Cancelled'  },
  pending:    { bg: '#FFF8E1', color: Palette.warning,  label: 'Pending'    },
  no_show:    { bg: '#F5F5F5', color: '#9E9E9E',         label: 'No Show'    },
};

// ─── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ item, onCancel, onQR }: {
  item: StaffBooking;
  onCancel: () => void;
  onQR: () => void;
}) {
  const sc       = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;
  const players  = item.players ?? (item.companions + 1);
  const canQR    = item.status === 'confirmed' || item.status === 'checked_in';
  const canCancel = item.status === 'confirmed' || item.status === 'pending';

  return (
    <View style={[styles.card, shadowMd]}>

      {/* ── Top: court + status ── */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={styles.courtIconWrap}>
            <Text style={{ fontSize: 20 }}>🏓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.courtName} numberOfLines={1}>{item.courtName}</Text>
            <Text style={styles.bookingId}>{item.id}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Details grid ── */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>📅 Date</Text>
          <Text style={styles.detailValue}>{fmtDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>🕐 Time</Text>
          <Text style={styles.detailValue}>{to12h(item.startTime)} – {to12h(item.endTime)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>⏱ Duration</Text>
          <Text style={styles.detailValue}>{item.durationHrs} hr{item.durationHrs !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>👥 Players</Text>
          <Text style={styles.detailValue}>{players} player{players !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Payment breakdown ── */}
      <View style={styles.paymentSection}>
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Court rental</Text>
          <Text style={styles.payValue}>₱{(item.subtotal ?? item.amount).toFixed(2)}</Text>
        </View>
        {item.serviceFee != null && item.serviceFee > 0 && (
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Service fee</Text>
            <Text style={styles.payValue}>₱{item.serviceFee.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.payRow, styles.payRowTotal]}>
          <Text style={styles.payTotalLabel}>Total Paid</Text>
          <Text style={styles.payTotalValue}>₱{item.amount.toFixed(2)}</Text>
        </View>
      </View>

      {/* ── Payment method badge ── */}
      <View style={styles.payMethodRow}>
        <View style={[styles.payMethodBadge, item.paid ? styles.paidBadge : styles.unpaidBadge]}>
          <Text style={[styles.payMethodText, { color: item.paid ? Palette.success : Palette.warning }]}>
            {item.paid ? `✓ Paid via ${item.paymentMethod ?? 'GCash'}` : '⚠️ Payment Pending'}
          </Text>
        </View>
      </View>

      {/* ── Actions ── */}
      {(canQR || canCancel) && (
        <View style={styles.actions}>
          {canQR && (
            <TouchableOpacity style={styles.qrBtn} onPress={onQR} accessibilityRole="button" accessibilityLabel="View QR ticket">
              <Text style={styles.qrBtnText}>🎫 QR Ticket</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel booking">
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BookingsTab() {
  const router = useRouter();
  const [tab,      setTab]      = useState<FilterTab>('all');
  const [bookings, setBookings] = useState<StaffBooking[]>([]);

  // Load once on mount
  useEffect(() => {
    const all = getAllBookings().sort((a, b) =>
      b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)
    );
    setBookings(all);
  }, []);

  const filtered = bookings.filter(b => {
    if (tab === 'all')       return true;
    if (tab === 'confirmed') return b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'pending';
    if (tab === 'completed') return b.status === 'completed';
    if (tab === 'cancelled') return b.status === 'cancelled' || b.status === 'no_show';
    return true;
  });

  const handleCancel = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    updateBooking(id, { status: 'cancelled' });
    if (booking) notifyBookingCancelled(booking.courtName, booking.date);
    setBookings(getAllBookings().sort((a, b) =>
      b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)
    ));
  };

  const handleQR = (item: StaffBooking) => {
    router.push({
      pathname: '/booking/qr-ticket',
      params: {
        bookingId:     item.id,
        courtName:     item.courtName,
        date:          item.date,
        startTime:     item.startTime,
        endTime:       item.endTime,
        duration:      String(item.durationHrs),
        grandTotal:    String(item.amount),
        paymentMethod: item.paymentMethod ?? 'GCash',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/availability')}
          accessibilityRole="button"
          accessibilityLabel="Book a court"
        >
          <Text style={styles.newBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
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

      {/* Count */}
      {filtered.length > 0 && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySub}>Book a court to get started</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/availability')} accessibilityRole="button">
              <Text style={styles.emptyBtnText}>Book a Court</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            item={item}
            onCancel={() => handleCancel(item.id)}
            onQR={() => handleQR(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F8FAFC' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title:         { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  newBtn:        { backgroundColor: Palette.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100 },
  newBtnText:    { color: '#fff', fontWeight: '700', fontSize: 13 },

  tabRow:        { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn:        { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:  { borderBottomColor: Palette.primary },
  tabText:       { fontSize: 12, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: Palette.primary, fontWeight: '700' },

  countRow:      { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  countText:     { fontSize: 12, color: '#64748B', fontWeight: '600' },

  list:          { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },

  empty:         { alignItems: 'center', paddingTop: 72, paddingHorizontal: Spacing.lg },
  emptyEmoji:    { fontSize: 52 },
  emptyTitle:    { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: Spacing.md },
  emptySub:      { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center' },
  emptyBtn:      { marginTop: Spacing.lg, backgroundColor: Palette.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 100 },
  emptyBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Card
  card:          { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  cardTopLeft:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1, marginRight: 8 },
  courtIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courtName:     { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  bookingId:     { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 1 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, flexShrink: 0 },
  statusText:    { fontSize: 11, fontWeight: '700' },

  divider:       { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: Spacing.md },

  // Details grid
  detailsGrid:   { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: 12 },
  detailItem:    { width: '47%' },
  detailLabel:   { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  detailValue:   { fontSize: 13, color: '#0F172A', fontWeight: '700' },

  // Payment
  paymentSection: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  payRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  payRowTotal:    { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 4, paddingTop: 8 },
  payLabel:       { fontSize: 12, color: '#64748B' },
  payValue:       { fontSize: 12, color: '#0F172A', fontWeight: '600' },
  payTotalLabel:  { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  payTotalValue:  { fontSize: 16, fontWeight: '900', color: Palette.primary },

  payMethodRow:   { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  payMethodBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  paidBadge:      { backgroundColor: '#E8F8EF' },
  unpaidBadge:    { backgroundColor: '#FFF8E1' },
  payMethodText:  { fontSize: 12, fontWeight: '600' },

  // Actions
  actions:        { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingTop: 0 },
  qrBtn:          { flex: 1, backgroundColor: '#F3E5F5', borderRadius: 10, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#8E44AD' },
  qrBtnText:      { color: '#8E44AD', fontWeight: '700', fontSize: 12 },
  cancelBtn:      { flex: 1, borderWidth: 1, borderColor: '#EF4444', borderRadius: 10, height: 40, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText:  { color: '#EF4444', fontWeight: '600', fontSize: 13 },
});
