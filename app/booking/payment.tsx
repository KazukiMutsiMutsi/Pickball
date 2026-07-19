import { Palette, Radius, Spacing } from '@/constants/theme';
import type { StaffBooking } from '@/src/booking/bookingStore';
import { addBooking, hasConflict, releasePendingHold } from '@/src/booking/bookingStore';
import { notifyBookingConfirmed } from '@/src/notifications/notificationStore';
import { generateQRMatrix, makeBookingToken } from '@/src/utils/qr';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Dummy QR renderer ────────────────────────────────────────────────────────
function QRCode({ data, size = 200 }: { data: string; size?: number }) {
  const matrix = useMemo(() => generateQRMatrix(data), [data]);
  const cell   = size / matrix.length;
  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 6, borderRadius: 12 }}>
      {matrix.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((filled, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: filled ? '#0F172A' : '#fff' }} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function to12h(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const GCASH_NUMBER   = '0917 123 4567';
const GCASH_ACCOUNT  = 'PicklePro Courts';

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; date: string;
    startTime: string; endTime: string; duration: string;
    grandTotal: string; total: string; players: string;
    serviceFee: string; holdId?: string;
  }>();

  const [step,    setStep]    = useState<'select' | 'gcash'>('select');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const grandTotal = parseFloat(params.grandTotal ?? '0');
  const players    = parseInt(params.players ?? '1');
  const holdId     = typeof params.holdId === 'string' ? params.holdId : undefined;

  // Generate QR token from booking params
  const qrToken = useMemo(() => makeBookingToken({
    bookingId: `PAY-${Date.now().toString(36).toUpperCase()}`,
    courtName: params.courtName ?? 'Court',
    date:      params.date ?? '',
    time:      params.startTime ?? '',
  }), []);

  const handleConfirmPayment = async () => {
    setError('');
    // Ignore our own pending hold; block if someone else booked/held it
    if (hasConflict(params.courtId, params.date, params.startTime, params.endTime, undefined, holdId)) {
      setError('This slot was just taken. Please go back and choose a different time.');
      releasePendingHold(holdId);
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}`;
      const booking: StaffBooking = {
        id:            bookingId,
        playerName:    'Customer',
        playerPhone:   '',
        courtId:       params.courtId,
        courtName:     params.courtName,
        date:          params.date,
        startTime:     params.startTime,
        endTime:       params.endTime,
        durationHrs:   parseFloat(params.duration ?? '1'),
        companions:    players - 1,
        players:       players,
        subtotal:      parseFloat(params.total ?? '0'),
        serviceFee:    parseFloat(params.serviceFee ?? '0'),
        amount:        grandTotal,
        paymentMethod: 'GCash',
        paid:          true,
        status:        'confirmed',
      };
      addBooking(booking);
      releasePendingHold(holdId); // Pending → Booked
      notifyBookingConfirmed({
        bookingId,
        courtName:  params.courtName,
        date:       params.date,
        startTime:  params.startTime,
        endTime:    params.endTime,
        grandTotal,
        players,
      });
      router.replace({
        pathname: '/booking/confirmation',
        params: { ...params, bookingId, paymentMethod: 'GCash', players: String(players) },
      });
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => step === 'gcash' ? setStep('select') : router.back()}
          style={s.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{step === 'select' ? 'Payment Method' : 'GCash Payment'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={s.progress}>
        {[0, 1, 2].map(i => (
          <React.Fragment key={i}>
            <View style={[s.dot, s.dotActive]} />
            {i < 2 && <View style={[s.line, s.lineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={s.progressLabels}>
        {['Time', 'Players', 'Payment'].map(label => (
          <Text key={label} style={[s.progressLabel, s.progressLabelActive]}>{label}</Text>
        ))}
      </View>

      {/* ── STEP 1: Select method ── */}
      {step === 'select' && (
        <>
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

            {/* Amount banner */}
            <View style={s.orderBanner}>
              <Text style={s.orderLabel}>Paying for</Text>
              <Text style={s.orderCourt}>{params.courtName}</Text>
              <Text style={s.orderAmount}>₱{grandTotal.toFixed(2)}</Text>
            </View>

            {holdId ? (
              <View style={s.holdBanner}>
                <Text style={s.holdBannerText}>
                  Your slot ({to12h(params.startTime)} – {to12h(params.endTime)}) is Pending. Confirm payment to mark it Booked.
                </Text>
              </View>
            ) : null}

            <Text style={s.sectionTitle}>Choose Payment Method</Text>

            {/* GCash — only option */}
            <TouchableOpacity
              style={s.methodCard}
              onPress={() => setStep('gcash')}
              accessibilityRole="button"
              accessibilityLabel="Pay with GCash"
            >
              <Image
                source={require('../../assets/images/gshocklogo.png')}
                style={s.methodLogo}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={s.methodName}>GCash</Text>
                <Text style={s.methodDesc}>Scan QR or send to GCash number</Text>
              </View>
              <Text style={s.methodArrow}>›</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </>
      )}

      {/* ── STEP 2: GCash QR + Summary ── */}
      {step === 'gcash' && (
        <>
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

            {/* GCash card */}
            <View style={s.gcashCard}>
              <View style={s.gcashHeader}>
                <Image
                  source={require('../../assets/images/gshocklogo.png')}
                  style={s.methodLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={s.gcashTitle}>Pay via GCash</Text>
                  <Text style={s.gcashSub}>Scan QR or send to number below</Text>
                </View>
              </View>

              <View style={s.qrWrap}>
                <QRCode data={qrToken} size={200} />
              </View>

              <View style={s.amountRow}>
                <Text style={s.amountLabel}>Amount to Pay</Text>
                <Text style={s.amountValue}>₱{grandTotal.toFixed(2)}</Text>
              </View>

              <View style={s.divider} />

              <Text style={s.orText}>— or send to —</Text>
              <View style={s.numberBox}>
                <Text style={s.numberLabel}>GCash Number</Text>
                <Text style={s.numberValue}>{GCASH_NUMBER}</Text>
                <Text style={s.numberAccount}>{GCASH_ACCOUNT}</Text>
              </View>

              <View style={s.gcashNote}>
                <Text style={s.gcashNoteText}>
                  Use your Booking ID as reference when sending payment.
                </Text>
              </View>
            </View>

            {/* Booking summary */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Booking Summary</Text>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Court</Text>
                <Text style={s.summaryValue}>{params.courtName}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Date</Text>
                <Text style={s.summaryValue}>{formatDate(params.date)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Time</Text>
                <Text style={s.summaryValue}>{to12h(params.startTime)} – {to12h(params.endTime)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Duration</Text>
                <Text style={s.summaryValue}>{params.duration} hr{parseFloat(params.duration ?? '1') !== 1 ? 's' : ''}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Players</Text>
                <Text style={s.summaryValue}>{players} player{players !== 1 ? 's' : ''}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Court Rental</Text>
                <Text style={s.summaryValue}>₱{parseFloat(params.total ?? '0').toFixed(2)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Service Fee (5%)</Text>
                <Text style={s.summaryValue}>₱{parseFloat(params.serviceFee ?? '0').toFixed(2)}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.summaryRow}>
                <Text style={s.summaryTotalLabel}>Total</Text>
                <Text style={s.summaryTotalValue}>₱{grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {!!error && <Text style={s.errorText}>{error}</Text>}
            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity
              style={[s.payBtn, loading && s.payBtnDisabled]}
              onPress={handleConfirmPayment}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.payBtnText}>I've Sent Payment  ·  ₱{grandTotal.toFixed(2)}</Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn:  { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },

  progress:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  dot:                 { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  dotActive:           { backgroundColor: Palette.primary },
  line:                { flex: 1, height: 2, backgroundColor: '#E2E8F0' },
  lineActive:          { backgroundColor: Palette.primary },
  progressLabels:      { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  progressLabel:       { fontSize: 11, color: '#94A3B8', flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  body: { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },

  // Method selection (step 1)
  orderBanner:    { backgroundColor: Palette.primary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  orderLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  orderCourt:     { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 2 },
  orderAmount:    { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 },
  holdBanner:     { backgroundColor: '#FFF7ED', borderRadius: 12, padding: Spacing.sm, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: '#F97316' },
  holdBannerText: { fontSize: 12, color: '#C2410C', fontWeight: '600', lineHeight: 17 },
  sectionTitle:   { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.sm },
  methodCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 2, borderColor: '#0070FF', gap: Spacing.md, shadowColor: '#0070FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  methodLogo:     { width: 44, height: 44 },
  methodName:     { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  methodDesc:     { fontSize: 12, color: '#64748B', marginTop: 2 },
  methodArrow:    { fontSize: 24, color: '#0070FF', fontWeight: '700' },
  gcashCard:     { backgroundColor: '#fff', borderRadius: 20, padding: Spacing.lg, marginBottom: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  gcashHeader:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg, alignSelf: 'flex-start' },
  gcashTitle:    { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  gcashSub:      { fontSize: 12, color: '#64748B', marginTop: 1 },
  qrWrap:        { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: Spacing.md },
  amountRow:     { alignItems: 'center', marginBottom: Spacing.md },
  amountLabel:   { fontSize: 12, color: '#64748B', fontWeight: '600' },
  amountValue:   { fontSize: 32, fontWeight: '900', color: '#0070FF', marginTop: 2 },
  orText:        { fontSize: 12, color: '#94A3B8', marginBottom: Spacing.md },
  numberBox:     { alignItems: 'center', backgroundColor: '#F0F7FF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, width: '100%' },
  numberLabel:   { fontSize: 11, color: '#64748B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  numberValue:   { fontSize: 24, fontWeight: '900', color: '#0070FF', letterSpacing: 2 },
  numberAccount: { fontSize: 13, color: '#0F172A', fontWeight: '600', marginTop: 4 },
  gcashNote:     { backgroundColor: '#FFFBEB', borderRadius: 10, padding: Spacing.sm, width: '100%', borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  gcashNoteText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: Spacing.sm, width: '100%' },

  // Summary card
  summaryCard:       { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  summaryTitle:      { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.sm },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  summaryLabel:      { fontSize: 13, color: '#64748B' },
  summaryValue:      { fontSize: 13, color: '#0F172A', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  summaryTotalValue: { fontSize: 18, fontWeight: '900', color: Palette.primary },

  errorText: { color: Palette.danger, fontSize: 13, backgroundColor: '#FEF2F2', padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.sm },

  footer:         { padding: Spacing.md, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  payBtn:         { backgroundColor: '#0070FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText:     { color: '#fff', fontSize: 15, fontWeight: '800' },
});
