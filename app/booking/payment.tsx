import { Palette, Radius, Spacing } from '@/constants/theme';
import type { StaffBooking } from '@/src/booking/bookingStore';
import { addBooking, hasConflict } from '@/src/booking/bookingStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentMethod = 'gcash';

function formatCardNumber(raw: string) { return raw; }
function formatExpiry(raw: string) { return raw; }

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; date: string; startTime: string;
    endTime: string; duration: string; grandTotal: string;
  }>();

  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grandTotal = parseFloat(params.grandTotal ?? '0');

  const handlePay = async () => {
    setError('');

    // ── Layer 2: server-side conflict re-check before confirming ──
    const endTime = params.endTime;
    if (hasConflict(params.courtId, params.date, params.startTime, endTime)) {
      setError(
        '⚠️ This slot was just taken by another player. Please go back and choose a different time.',
      );
      return;
    }

    setLoading(true);
    try {
      // TODO: integrate real payment gateway (Stripe, etc.)
      await new Promise((r) => setTimeout(r, 1500));

      // Register the booking in the shared store
      const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}`;
      const newBooking: StaffBooking = {
        id:          bookingId,
        playerName:  'Customer',
        playerPhone: '',
        courtId:     params.courtId,
        courtName:   params.courtName,
        date:        params.date,
        startTime:   params.startTime,
        endTime:     endTime,
        durationHrs: parseFloat(params.duration ?? '1'),
        companions:  0,
        amount:      parseFloat(params.grandTotal ?? '0'),
        paid:        true,
        status:      'confirmed',
      };
      addBooking(newBooking);

      router.replace({
        pathname: '/booking/confirmation',
        params: {
          ...params,
          bookingId,
          paymentMethod: method,
        },
      });
    } catch (e: any) {
      setError(e.message ?? 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'gcash', label: 'GCash', icon: '📱' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <View style={[styles.dot, styles.dotActive]} />
            {i < 2 && <View style={[styles.line, styles.lineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {['Time', 'Summary', 'Payment'].map((s) => (
          <Text key={s} style={[styles.progressLabel, styles.progressLabelActive]}>{s}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Order summary banner */}
        <View style={styles.orderBanner}>
          <Text style={styles.orderLabel}>Paying for</Text>
          <Text style={styles.orderCourt}>{params.courtName}</Text>
          <Text style={styles.orderAmount}>₱{grandTotal.toFixed(2)}</Text>
        </View>

        {/* Payment method selection */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodRow, method === m.id && styles.methodRowActive]}
            onPress={() => setMethod(m.id)}
            accessibilityRole="radio"
            accessibilityLabel={m.label}
            accessibilityState={{ checked: method === m.id }}
          >
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>{m.label}</Text>
            <View style={[styles.radio, method === m.id && styles.radioActive]}>
              {method === m.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* GCash note */}
        <View style={styles.altMethodNote}>
          <Text style={styles.altMethodText}>
            You'll receive a GCash payment request to complete your booking.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={`Pay ₱${grandTotal.toFixed(2)}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₱{grandTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200, maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn: { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  dotActive: { backgroundColor: Palette.primary },
  line: { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  lineActive: { backgroundColor: Palette.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  progressLabel: { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  body: { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },

  orderBanner: { backgroundColor: Palette.primary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  orderLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  orderCourt: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 2 },
  orderAmount: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.grey900, marginBottom: Spacing.sm },

  methodRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Palette.grey300, marginBottom: Spacing.sm, backgroundColor: Palette.grey50 },
  methodRowActive: { borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  methodIcon: { fontSize: 22, marginRight: Spacing.md },
  methodLabel: { flex: 1, fontSize: 14, color: Palette.grey800, fontWeight: '500' },
  methodLabelActive: { color: Palette.primary, fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Palette.grey400, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Palette.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.primary },

  cardForm: { marginTop: Spacing.sm },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Palette.grey700, marginBottom: 4, marginTop: Spacing.sm },
  input: { borderWidth: 1, borderColor: Palette.grey300, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 13, fontSize: 15, color: Palette.grey900, backgroundColor: Palette.grey50 },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  secureNote: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.sm },
  secureIcon: { fontSize: 14, marginRight: 6 },
  secureText: { fontSize: 12, color: Palette.grey600, flex: 1 },
  errorText: { color: Palette.danger, fontSize: 13, backgroundColor: '#FDECEA', padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.sm },

  altMethodNote: { marginTop: Spacing.md, backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.md },
  altMethodText: { fontSize: 13, color: Palette.grey700, textAlign: 'center' },

  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200, maxWidth: 480, alignSelf: 'center', width: '100%' },
  payBtn: { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
