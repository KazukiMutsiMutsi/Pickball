import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const SERVICE_FEE_RATE = 0.05; // kept for fallback calculation

export default function BookingSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; price: string;
    date: string; startTime: string; endTime: string;
    duration: string; total: string; players: string;
    serviceFee: string; grandTotal: string; holdId?: string;
  }>();

  const players    = parseInt(params.players ?? '1');
  const subtotal   = parseFloat(params.total ?? '0');
  const serviceFee = parseFloat(params.serviceFee ?? String(subtotal * 0.05));
  const grandTotal = parseFloat(params.grandTotal ?? String(subtotal + serviceFee));

  const handleProceed = () => {
    router.push({
      pathname: '/booking/payment',
      params: {
        ...params,
        discount:   '0',
        serviceFee: String(serviceFee),
        grandTotal: String(grandTotal),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress: Time → Players → Payment */}
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <View style={[styles.dot, styles.dotActive]} />
            {i < 2 && <View style={[styles.line, styles.lineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {['Time', 'Players', 'Payment'].map((label, i) => (
          <Text key={label} style={[styles.progressLabel, styles.progressLabelActive]}>{label}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Court card */}
        <View style={styles.courtCard}>
          <View style={styles.courtDetails}>
            <Text style={styles.courtName}>{params.courtName}</Text>
            <Text style={styles.courtMeta}>{formatDate(params.date)}</Text>
            <Text style={styles.courtMeta}>{to12h(params.startTime)} – {to12h(params.endTime)}</Text>
            <Text style={styles.courtMeta}>{params.duration} hr{parseFloat(params.duration) !== 1 ? 's' : ''}</Text>
            <Text style={styles.courtMeta}>{players} player{players !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Price breakdown */}
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Court rental ({params.duration} hr{parseFloat(params.duration) !== 1 ? 's' : ''} × ₱{params.price}/hr)
            </Text>
            <Text style={styles.priceValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee (5%)</Text>
            <Text style={styles.priceValue}>₱{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Cancellation policy */}
        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Free cancellation up to 24 hours before your booking. After that, a 50% fee applies.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>₱{grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceed}
          accessibilityRole="button"
          accessibilityLabel="Proceed to payment"
        >
          <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#fff' },
  header:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:             { width: 40 },
  backIcon:            { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:               { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  progress:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  dot:                 { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  dotActive:           { backgroundColor: Palette.primary },
  line:                { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  lineActive:          { backgroundColor: Palette.primary },
  progressLabels:      { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressLabel:       { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  body:                { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },
  courtCard:           { backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  courtDetails:        { gap: 4 },
  courtName:           { fontSize: 15, fontWeight: '700', color: Palette.grey900 },
  courtMeta:           { fontSize: 13, color: Palette.grey600 },

  sectionTitle:        { fontSize: 15, fontWeight: '700', color: Palette.grey900, marginBottom: Spacing.sm, marginTop: Spacing.sm },

  priceCard:           { backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  priceRow:            { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel:          { fontSize: 13, color: Palette.grey600, flex: 1, marginRight: 8 },
  priceValue:          { fontSize: 13, color: Palette.grey900 },
  divider:             { height: 1, backgroundColor: Palette.grey300, marginVertical: 4 },
  totalLabel:          { fontSize: 15, fontWeight: '700', color: Palette.grey900 },
  totalValue:          { fontSize: 15, fontWeight: '800', color: Palette.primary },

  policyBox:           { marginTop: Spacing.md, backgroundColor: '#FFF8E6', borderRadius: Radius.md, padding: Spacing.md },
  policyTitle:         { fontSize: 13, fontWeight: '700', color: Palette.warning, marginBottom: 4 },
  policyText:          { fontSize: 12, color: Palette.grey700, lineHeight: 18 },

  footer:              { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200, gap: Spacing.sm, alignSelf: 'center', width: '100%', maxWidth: 480 },
  footerTotal:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTotalLabel:    { fontSize: 14, color: Palette.grey600 },
  footerTotalValue:    { fontSize: 20, fontWeight: '800', color: Palette.grey900 },
  proceedBtn:          { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  proceedBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
});
