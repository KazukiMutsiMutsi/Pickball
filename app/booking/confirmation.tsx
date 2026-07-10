import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function to12h(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Credit / Debit Card',
  paypal: 'PayPal',
  apple: 'Apple Pay',
  google: 'Google Pay',
};

export default function ConfirmationScreen() {
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

  const checkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const details = [
    { label: 'Booking ID', value: params.bookingId },
    { label: 'Court', value: params.courtName },
    { label: 'Date', value: formatDate(params.date) },
    { label: 'Time', value: `${to12h(params.startTime)} – ${to12h(params.endTime)}` },
    { label: 'Duration', value: `${params.duration} hr${parseFloat(params.duration) !== 1 ? 's' : ''}` },
    { label: 'Payment', value: METHOD_LABELS[params.paymentMethod] ?? params.paymentMethod },
    { label: 'Total Paid', value: `$${parseFloat(params.grandTotal).toFixed(2)}` },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Success badge */}
        <Animated.View style={[styles.checkWrap, { transform: [{ scale: checkScale }] }]}>
          <Text style={styles.checkEmoji}>✅</Text>
        </Animated.View>

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={styles.headline}>Booking Confirmed!</Text>
          <Text style={styles.subline}>
            Your court is reserved. Get ready to play!
          </Text>

          {/* Details card */}
          <View style={styles.card}>
            {details.map((d, i) => (
              <View key={d.label} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={[styles.detailValue, d.label === 'Booking ID' && styles.bookingIdText]}>
                  {d.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Before you go</Text>
            {[
              '🏓 Bring your own paddle or rent one at the venue',
              '👟 Wear non-marking court shoes',
              '💧 Stay hydrated — bring a water bottle',
              '📍 Arrive 10 minutes early to warm up',
            ].map((tip) => (
              <Text key={tip} style={styles.tipText}>{tip}</Text>
            ))}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => router.push({
              pathname: '/booking/qr-ticket',
              params: {
                bookingId:     params.bookingId,
                courtName:     params.courtName,
                date:          params.date,
                startTime:     params.startTime,
                endTime:       params.endTime,
                duration:      params.duration,
                grandTotal:    params.grandTotal,
                paymentMethod: params.paymentMethod,
              },
            })}
            accessibilityRole="button"
            accessibilityLabel="View QR ticket"
          >
            <Text style={styles.qrBtnText}>🎫 View QR Check-in Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/booking/history')}
            accessibilityRole="button"
            accessibilityLabel="View my bookings"
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: Spacing.lg, alignItems: 'center' },
  checkWrap: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  checkEmoji: { fontSize: 80 },
  headline: { fontSize: 26, fontWeight: '900', color: Palette.grey900, textAlign: 'center', marginBottom: 6 },
  subline: { fontSize: 14, color: Palette.grey600, textAlign: 'center', marginBottom: Spacing.lg },

  card: {
    width: '100%',
    backgroundColor: Palette.grey50,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.grey200,
  },
  detailRow: { paddingVertical: Spacing.sm },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: Palette.grey200 },
  detailLabel: { fontSize: 12, color: Palette.grey500, marginBottom: 2 },
  detailValue: { fontSize: 14, color: Palette.grey900, fontWeight: '600' },
  bookingIdText: { color: Palette.primary, fontFamily: 'monospace' },

  tipsCard: {
    width: '100%',
    backgroundColor: Palette.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: Palette.primary, marginBottom: 4 },
  tipText: { fontSize: 13, color: Palette.grey700 },

  qrBtn: {
    width: '100%',
    backgroundColor: '#F3E5F5',
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: '#8E44AD',
  },
  qrBtnText: { color: '#8E44AD', fontSize: 15, fontWeight: '800' },
  primaryBtn: {
    width: '100%',
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Palette.primary, fontSize: 16, fontWeight: '600' },
});
