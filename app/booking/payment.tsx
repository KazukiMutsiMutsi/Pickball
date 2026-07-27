import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuthContext } from '@/src/context/AuthContext';
import { courtsService } from '@/src/services/courts.service';
import { paymentService } from '@/src/services/payment.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const DEFAULT_GCASH_NUMBER  = '0917 123 4567';
const DEFAULT_GCASH_ACCOUNT = 'PicklePro Courts';

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ activeStep }: { activeStep: number }) {
  const steps = ['Payment', 'GCash', 'Confirm'];
  return (
    <View style={s.progressWrap}>
      <View style={s.progressTrack}>
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <View style={s.progressStep}>
              <View style={[s.progressDot, i <= activeStep && s.progressDotActive]}>
                <Text style={[s.progressDotNum, i <= activeStep && s.progressDotNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[s.progressLabel, i <= activeStep && s.progressLabelActive]}>{label}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[s.progressLine, i < activeStep && s.progressLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; date: string;
    startTime: string; endTime: string; duration: string;
    grandTotal: string; total: string; serviceFee: string;
    holdId?: string;
  }>();

  const [step, setStep]               = useState<'select' | 'gcash'>('select');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [paymentLoading, setPaymentLoading]   = useState(false);
  const [gcashNumber,  setGcashNumber]  = useState(DEFAULT_GCASH_NUMBER);
  const [gcashAccount, setGcashAccount] = useState(DEFAULT_GCASH_ACCOUNT);
  const [checkoutUrl, setCheckoutUrl]   = useState<string | null>(null);
  const [currentBookingDbId, setCurrentBookingDbId] = useState<string | null>(null);
  const [currentBookingRef,  setCurrentBookingRef]  = useState<string | null>(null);

  const grandTotal = parseFloat(params.grandTotal ?? '0');

  // Fetch live GCash settings from backend
  useEffect(() => {
    courtsService.getGcash()
      .then(g => { setGcashNumber(g.phone_number); setGcashAccount(g.account_name); })
      .catch(() => { /* keep defaults */ });
  }, []);

  // ── Step 1: Tap GCash → create booking + PayMongo link ──────────────────────
  const handleSelectGcash = useCallback(async () => {
    if (!user?.token) {
      Alert.alert('Not logged in', 'Please log in to continue.');
      return;
    }
    setPaymentLoading(true);
    try {
      // 1. Create the booking on the backend (status = pending)
      const bookingResult = await (await import('@/src/services/bookings.service')).bookingsService.create(
        {
          courtId:   params.courtId,
          date:      params.date,
          startSlot: params.startTime,
          endSlot:   params.endTime,
          players:   1, // default, user picks on next screen
        },
        user.token,
      );

      const bookingDbId  = bookingResult.booking.id;
      const bookingRef   = bookingResult.booking.booking_ref;

      // 2. Create PayMongo GCash payment link
      const payResult = await paymentService.createGcashLink(bookingDbId, user.token);
      setCheckoutUrl(payResult.checkoutUrl);

      // Store booking IDs for later screens
      setCurrentBookingDbId(bookingDbId);
      setCurrentBookingRef(bookingRef);
      setStep('gcash');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start payment.';
      if (msg.includes('409') || msg.includes('already been reserved')) {
        Alert.alert('Slot taken', 'This slot was just booked. Please go back and choose another time.');
        router.back();
      } else {
        Alert.alert('Payment Error', msg);
      }
    } finally {
      setPaymentLoading(false);
    }
  }, [params, user?.token]);

  // ── Step 2: Open PayMongo checkout in browser ─────────────────────────────
  const handleOpenGcash = useCallback(async () => {
    if (!checkoutUrl) {
      // Fallback: manual flow
      handleNavigateToConfirm();
      return;
    }
    try {
      const result = await WebBrowser.openBrowserAsync(checkoutUrl);
      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed browser — go to confirm screen
        // Backend webhook will confirm automatically when PayMongo processes it
        handleNavigateToConfirm();
      }
    } catch {
      handleNavigateToConfirm();
    }
  }, [checkoutUrl]);

  const handleNavigateToConfirm = () => {
    router.push({
      pathname: '/booking/players',
      params: {
        ...params,
        bookingDbId: currentBookingDbId ?? '',
        bookingRef:  currentBookingRef  ?? '',
      },
    });
  };

  const handleChangeSlot = () => {
    setShowLeaveDialog(false);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => step === 'gcash' ? setStep('select') : setShowLeaveDialog(true)}
          style={s.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{step === 'select' ? 'Payment Method' : 'GCash Payment'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ProgressBar activeStep={step === 'select' ? 0 : 1} />

      {/* ── STEP 1: Select method ── */}
      {step === 'select' && (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

          <View style={s.orderBanner}>
            <Text style={s.orderLabel}>Paying for</Text>
            <Text style={s.orderCourt}>{params.courtName}</Text>
            <Text style={s.orderAmount}>₱{grandTotal.toFixed(2)}</Text>
          </View>

          <View style={s.holdBanner}>
            <Text style={s.holdBannerText}>
              Your slot ({to12h(params.startTime)} – {to12h(params.endTime)}) is Pending.
              Complete payment to confirm your booking.
            </Text>
          </View>

          <Text style={s.sectionTitle}>Choose Payment Method</Text>

          <TouchableOpacity
            style={[s.methodCard, paymentLoading && { opacity: 0.6 }]}
            onPress={handleSelectGcash}
            disabled={paymentLoading}
            accessibilityRole="button"
            accessibilityLabel="Pay with GCash"
          >
            {paymentLoading ? (
              <ActivityIndicator color={Palette.primary} style={{ width: 44 }} />
            ) : (
              <Image
                source={require('../../assets/images/gshocklogo.png')}
                style={s.methodLogo}
                resizeMode="contain"
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.methodName}>GCash</Text>
              <Text style={s.methodDesc}>
                {paymentLoading ? 'Opening payment…' : 'Pay securely via PayMongo'}
              </Text>
            </View>
            {!paymentLoading && <Text style={s.methodArrow}>›</Text>}
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* ── STEP 2: GCash details ── */}
      {step === 'gcash' && (
        <>
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

            <View style={s.gcashCard}>
              <View style={s.gcashHeader}>
                <Image
                  source={require('../../assets/images/gshocklogo.png')}
                  style={s.methodLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={s.gcashTitle}>Pay via GCash</Text>
                  <Text style={s.gcashSub}>
                    {checkoutUrl
                      ? 'Tap the button below to open GCash checkout'
                      : 'Send to the number below'}
                  </Text>
                </View>
              </View>

              <View style={s.amountRow}>
                <Text style={s.amountLabel}>Amount to Pay</Text>
                <Text style={s.amountValue}>₱{grandTotal.toFixed(2)}</Text>
              </View>

              <View style={s.divider} />

              {/* PayMongo checkout available */}
              {checkoutUrl ? (
                <View style={s.paymongoBox}>
                  <Text style={s.paymongoIcon}>💳</Text>
                  <Text style={s.paymongoTitle}>Secure GCash Checkout</Text>
                  <Text style={s.paymongoSub}>
                    Tap the button below. You'll be taken to a secure PayMongo page to complete your GCash payment.
                  </Text>
                  <TouchableOpacity style={s.openPayBtn} onPress={handleOpenGcash}>
                    <Text style={s.openPayBtnText}>Open GCash Checkout →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Fallback: manual GCash number */
                <>
                  <Text style={s.orText}>— send to —</Text>
                  <View style={s.numberBox}>
                    <Text style={s.numberLabel}>GCash Number</Text>
                    <Text style={s.numberValue}>{gcashNumber}</Text>
                    <Text style={s.numberAccount}>{gcashAccount}</Text>
                  </View>
                  <View style={s.gcashNote}>
                    <Text style={s.gcashNoteText}>
                      Use your Booking ID as reference when sending payment.
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Booking summary */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Booking Summary</Text>
              {[
                { label: 'Court',        value: params.courtName },
                { label: 'Date',         value: formatDate(params.date) },
                { label: 'Time',         value: `${to12h(params.startTime)} – ${to12h(params.endTime)}` },
                { label: 'Duration',     value: `${params.duration} hr${parseFloat(params.duration ?? '1') !== 1 ? 's' : ''}` },
              ].map(row => (
                <View key={row.label} style={s.summaryRow}>
                  <Text style={s.summaryLabel}>{row.label}</Text>
                  <Text style={s.summaryValue}>{row.value}</Text>
                </View>
              ))}
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

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer — shown only for manual fallback */}
          {!checkoutUrl && (
            <View style={s.footer}>
              <TouchableOpacity
                style={s.payBtn}
                onPress={handleNavigateToConfirm}
                accessibilityRole="button"
              >
                <Text style={s.payBtnText}>I've Sent Payment  ·  ₱{grandTotal.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* ── Leave dialog ── */}
      <Modal
        visible={showLeaveDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveDialog(false)}
      >
        <Pressable style={d.overlay} onPress={() => setShowLeaveDialog(false)}>
          <Pressable style={d.sheet} onPress={e => e.stopPropagation()}>
            <View style={d.handle} />
            <Text style={d.title}>Leave Booking?</Text>
            <Text style={d.subtitle}>
              Your slot{' '}
              <Text style={d.highlight}>{to12h(params.startTime)} – {to12h(params.endTime)}</Text>
              {' '}is pending. What would you like to do?
            </Text>

            <TouchableOpacity style={d.optionCard} onPress={handleChangeSlot}>
              <View style={[d.optionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Text style={d.optionEmoji}>🔄</Text>
              </View>
              <View style={d.optionText}>
                <Text style={d.optionTitle}>Change Time Slot</Text>
                <Text style={d.optionSub}>Go back and pick a different time</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[d.optionCard, d.optionCardActive]}
              onPress={() => setShowLeaveDialog(false)}
            >
              <View style={[d.optionIcon, { backgroundColor: Palette.primaryLight }]}>
                <Text style={d.optionEmoji}>✅</Text>
              </View>
              <View style={d.optionText}>
                <Text style={[d.optionTitle, { color: Palette.primary }]}>Continue Booking</Text>
                <Text style={d.optionSub}>Stay and complete your payment</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  backBtn:  { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },

  progressWrap:         { backgroundColor: '#fff', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  progressTrack:        { flexDirection: 'row', alignItems: 'center' },
  progressStep:         { alignItems: 'center', gap: 4 },
  progressDot:          { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  progressDotActive:    { backgroundColor: Palette.primary },
  progressDotNum:       { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  progressDotNumActive: { color: '#fff' },
  progressLine:         { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginBottom: 14 },
  progressLineDone:     { backgroundColor: Palette.primary },
  progressLabel:        { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  progressLabelActive:  { color: Palette.primary },

  body: { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },

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
  amountRow:     { alignItems: 'center', marginBottom: Spacing.md },
  amountLabel:   { fontSize: 12, color: '#64748B', fontWeight: '600' },
  amountValue:   { fontSize: 32, fontWeight: '900', color: '#0070FF', marginTop: 2 },
  divider:       { height: 1, backgroundColor: '#F1F5F9', marginVertical: Spacing.sm, width: '100%' },

  // PayMongo checkout box
  paymongoBox:    { alignItems: 'center', width: '100%', padding: Spacing.md, backgroundColor: '#F0F7FF', borderRadius: 16, gap: Spacing.sm },
  paymongoIcon:   { fontSize: 36 },
  paymongoTitle:  { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  paymongoSub:    { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  openPayBtn:     { backgroundColor: '#0070FF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: Spacing.sm },
  openPayBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Manual fallback
  orText:        { fontSize: 12, color: '#94A3B8', marginBottom: Spacing.md },
  numberBox:     { alignItems: 'center', backgroundColor: '#F0F7FF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, width: '100%' },
  numberLabel:   { fontSize: 11, color: '#64748B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  numberValue:   { fontSize: 24, fontWeight: '900', color: '#0070FF', letterSpacing: 2 },
  numberAccount: { fontSize: 13, color: '#0F172A', fontWeight: '600', marginTop: 4 },
  gcashNote:     { backgroundColor: '#FFFBEB', borderRadius: 10, padding: Spacing.sm, width: '100%', borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  gcashNoteText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  summaryCard:       { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  summaryTitle:      { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.sm },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  summaryLabel:      { fontSize: 13, color: '#64748B' },
  summaryValue:      { fontSize: 13, color: '#0F172A', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  summaryTotalValue: { fontSize: 18, fontWeight: '900', color: Palette.primary },

  footer:     { padding: Spacing.md, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff' },
  payBtn:     { backgroundColor: '#0070FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

const d = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 36, gap: Spacing.md },
  handle:           { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: Spacing.sm },
  title:            { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle:         { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  highlight:        { fontWeight: '700', color: '#0F172A' },
  optionCard:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#F8FAFC', borderRadius: 16, padding: Spacing.md, borderWidth: 1.5, borderColor: '#E2E8F0' },
  optionCardActive: { backgroundColor: Palette.primaryLight, borderColor: Palette.primary },
  optionIcon:       { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionEmoji:      { fontSize: 22 },
  optionText:       { flex: 1 },
  optionTitle:      { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  optionSub:        { fontSize: 12, color: '#64748B', lineHeight: 17 },
});
