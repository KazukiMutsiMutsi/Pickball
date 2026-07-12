import { Palette, Spacing } from '@/constants/theme';
import { generateQRMatrix, makeBookingToken } from '@/src/utils/qr';
import { shadowMd } from '@/src/utils/shadow';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── QR Matrix renderer ───────────────────────────────────────────────────────
function QRCode({ data, size = 220 }: { data: string; size?: number }) {
  const matrix = useMemo(() => generateQRMatrix(data), [data]);
  const cellSize = size / matrix.length;

  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 8, borderRadius: 12 }}>
      {matrix.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? '#0F172A' : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function QRTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    grandTotal: string;
    paymentMethod: string;
  }>();

  const token = useMemo(() => makeBookingToken({
    bookingId: params.bookingId ?? 'BKG-000',
    courtName: params.courtName ?? 'Court',
    date:      params.date ?? '',
    time:      params.startTime ?? '',
  }), [params]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `PicklePro Booking Ticket\n\nBooking ID: ${params.bookingId}\nCourt: ${params.courtName}\nDate: ${params.date}\nTime: ${params.startTime}\n\nShow this QR code at the court entrance.`,
        title: 'My PicklePro Booking Ticket',
      });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Your QR Ticket</Text>
        <TouchableOpacity onPress={handleShare} style={s.shareBtn} accessibilityLabel="Share ticket">
          <Text style={s.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Ticket card */}
        <View style={[s.ticket, shadowMd]}>
          {/* Top section — court info */}
          <View style={s.ticketTop}>
            <Text style={s.ticketEmoji}>🏓</Text>
            <Text style={s.ticketCourt}>{params.courtName ?? 'Court'}</Text>
            <Text style={s.ticketLocation}>📍 8X66+R3 Lapu-Lapu, Cebu</Text>
          </View>

          {/* Perforated divider */}
          <View style={s.perforated}>
            <View style={s.perforatedCircleLeft} />
            <View style={s.perforatedLine} />
            <View style={s.perforatedCircleRight} />
          </View>

          {/* Booking details */}
          <View style={s.ticketDetails}>
            <View style={s.detailRow}>
              <View style={s.detailItem}>
                <Text style={s.detailLabel}>DATE</Text>
                <Text style={s.detailValue}>{params.date ?? '—'}</Text>
              </View>
              <View style={s.detailItem}>
                <Text style={s.detailLabel}>TIME</Text>
                <Text style={s.detailValue}>{params.startTime ?? '—'}</Text>
              </View>
            </View>
            <View style={s.detailRow}>
              <View style={s.detailItem}>
                <Text style={s.detailLabel}>DURATION</Text>
                <Text style={s.detailValue}>{params.duration ?? '1'} hr{parseFloat(params.duration ?? '1') !== 1 ? 's' : ''}</Text>
              </View>
              <View style={s.detailItem}>
                <Text style={s.detailLabel}>TOTAL PAID</Text>
                <Text style={[s.detailValue, { color: Palette.primary }]}>₱{parseFloat(params.grandTotal ?? '0').toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Perforated divider 2 */}
          <View style={s.perforated}>
            <View style={s.perforatedCircleLeft} />
            <View style={s.perforatedLine} />
            <View style={s.perforatedCircleRight} />
          </View>

          {/* QR code section */}
          <View style={s.qrSection}>
            <Text style={s.qrInstructions}>Show this QR code at the court entrance</Text>
            <View style={s.qrWrap}>
              <QRCode data={token} size={200} />
            </View>
            <Text style={s.bookingId}>{params.bookingId ?? 'BKG-000'}</Text>
            <View style={[s.statusBadge, { backgroundColor: '#E8F8EF' }]}>
              <View style={s.statusDot} />
              <Text style={s.statusText}>Valid · Ready to scan</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={s.instructions}>
          {[
            { icon: '📱', text: 'Open this screen at the court entrance' },
            { icon: '🔍', text: 'Staff will scan your QR code to check you in' },
            { icon: '✅', text: 'Green tick confirms your booking is valid' },
            { icon: '⚠️', text: 'Each QR code is unique and single-use' },
          ].map((item, i) => (
            <View key={i} style={s.instrRow}>
              <Text style={s.instrIcon}>{item.icon}</Text>
              <Text style={s.instrText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Go to bookings */}
        <TouchableOpacity style={s.bookingsBtn} onPress={() => router.push('/(tabs)/bookings')} accessibilityRole="button" accessibilityLabel="View all bookings">
          <Text style={s.bookingsBtnText}>View All My Bookings →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn:  { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  shareBtn: { width: 40, alignItems: 'flex-end' },
  shareIcon:{ fontSize: 20 },
  body:     { padding: Spacing.md, alignItems: 'center', alignSelf: 'center', width: '100%', maxWidth: 480 },

  // Ticket
  ticket:           { width: '100%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: Spacing.md },
  ticketTop:        { alignItems: 'center', padding: Spacing.lg, backgroundColor: Palette.primary },
  ticketEmoji:      { fontSize: 52, marginBottom: Spacing.sm },
  ticketCourt:      { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' },
  ticketLocation:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // Perforated
  perforated:           { flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 },
  perforatedCircleLeft: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F8FAFC', marginLeft: -11 },
  perforatedCircleRight:{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F8FAFC', marginRight: -11 },
  perforatedLine:        { flex: 1, height: 1, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },

  // Details
  ticketDetails: { padding: Spacing.md },
  detailRow:     { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  detailItem:    { flex: 1 },
  detailLabel:   { fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  detailValue:   { fontSize: 16, fontWeight: '800', color: '#0F172A' },

  // QR
  qrSection:      { alignItems: 'center', padding: Spacing.lg },
  qrInstructions: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: Spacing.md },
  qrWrap:         { padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  bookingId:      { fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: Spacing.md, letterSpacing: 1 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  statusDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.success },
  statusText:     { fontSize: 12, color: Palette.success, fontWeight: '700' },

  // Instructions
  instructions: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  instrRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  instrIcon:    { fontSize: 18, width: 28 },
  instrText:    { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20 },

  bookingsBtn:     { backgroundColor: Palette.primaryLight, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: 12 },
  bookingsBtnText: { color: Palette.primary, fontWeight: '700', fontSize: 14 },
});
