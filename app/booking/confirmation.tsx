import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// ─── Confetti particle ────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#FFD700', '#1A8FE3', '#27AE60', '#E74C3C', '#8E44AD', '#F39C12'];
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: (Math.random() - 0.5) * W * 0.9,
  delay: Math.random() * 400,
  size: 6 + Math.random() * 8,
  rotate: Math.random() * 360,
}));

function ConfettiParticle({ x, color, delay, size, rotate }: typeof PARTICLES[0]) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(320, { duration: 1200, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(x,   { duration: 1200, easing: Easing.out(Easing.sin) }));
    opacity.value    = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(700, withTiming(0, { duration: 300 })),
    ));
    scale.value      = withDelay(delay, withSpring(1, { damping: 8 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotate}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        top: 0,
        left: W / 2,
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color,
      }, style]}
    />
  );
}

// ─── Animated checkmark circle ────────────────────────────────────────────────
function CheckCircle() {
  const scale   = useSharedValue(0);
  const ring1   = useSharedValue(1);
  const ring1Op = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 6, stiffness: 180 });
    ring1.value = withDelay(300, withRepeat(
      withTiming(1.6, { duration: 900, easing: Easing.out(Easing.quad) }), -1, false,
    ));
    ring1Op.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(0.4, { duration: 100 }),
        withTiming(0,   { duration: 800 }),
      ), -1, false,
    ));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: ring1Op.value,
  }));

  return (
    <View style={cc.wrap}>
      {/* Pulse ring */}
      <Animated.View style={[cc.ring, ringStyle]} />
      {/* Main circle */}
      <Animated.View style={[cc.circle, circleStyle]}>
        <Text style={cc.check}>✓</Text>
      </Animated.View>
    </View>
  );
}

const cc = StyleSheet.create({
  wrap:   { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  ring:   { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: Palette.success + '60' },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Palette.success, alignItems: 'center', justifyContent: 'center', shadowColor: Palette.success, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  check:  { fontSize: 48, color: '#fff', fontWeight: '900', lineHeight: 56 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function to12h(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId: string; courtName: string; date: string;
    startTime: string; endTime: string; duration: string;
    grandTotal: string; paymentMethod: string; players: string;
  }>();

  const details = [
    { label: 'Booking ID', value: params.bookingId },
    { label: 'Court',      value: params.courtName },
    { label: 'Date',       value: formatDate(params.date) },
    { label: 'Time',       value: `${to12h(params.startTime)} – ${to12h(params.endTime)}` },
    { label: 'Duration',   value: `${params.duration} hr${parseFloat(params.duration ?? '1') !== 1 ? 's' : ''}` },
    { label: 'Players',    value: `${params.players ?? '1'} player${parseInt(params.players ?? '1') !== 1 ? 's' : ''}` },
    { label: 'Payment',    value: params.paymentMethod ?? 'GCash' },
    { label: 'Total Paid', value: `₱${parseFloat(params.grandTotal ?? '0').toFixed(2)}` },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Confetti layer */}
      <View style={s.confettiLayer} pointerEvents="none">
        {PARTICLES.map(p => <ConfettiParticle key={p.id} {...p} />)}
      </View>

      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Check circle */}
        <Animated.View entering={FadeInUp.delay(0).springify()} style={s.checkWrap}>
          <CheckCircle />
        </Animated.View>

        {/* Headline */}
        <Animated.Text entering={FadeInUp.delay(200).springify()} style={s.headline}>
          Booking Confirmed! 🎉
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(300).springify()} style={s.subline}>
          Your court is reserved. Get ready to play!
        </Animated.Text>

        {/* Details card */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={s.card}>
          {details.map((d, i) => (
            <View key={d.label} style={[s.detailRow, i > 0 && s.detailRowBorder]}>
              <Text style={s.detailLabel}>{d.label}</Text>
              <Text style={[s.detailValue, d.label === 'Booking ID' && s.bookingIdText]}>
                {d.value}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={s.tipsCard}>
          <Text style={s.tipsTitle}>Before you go</Text>
          {[
            '🏓 Bring your own paddle or rent one at the venue',
            '👟 Wear non-marking court shoes',
            '💧 Stay hydrated — bring a water bottle',
            '📍 Arrive 10 minutes early to warm up',
          ].map(tip => <Text key={tip} style={s.tipText}>{tip}</Text>)}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={s.actions}>
          <TouchableOpacity
            style={s.qrBtn}
            onPress={() => router.push({
              pathname: '/booking/qr-ticket',
              params: {
                bookingId: params.bookingId, courtName: params.courtName,
                date: params.date, startTime: params.startTime, endTime: params.endTime,
                duration: params.duration, grandTotal: params.grandTotal,
                paymentMethod: params.paymentMethod,
              },
            })}
            accessibilityRole="button"
            accessibilityLabel="View QR ticket"
          >
            <Text style={s.qrBtnText}>🎫 View QR Check-in Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.replace('/booking/history')}
            accessibilityRole="button"
            accessibilityLabel="View my bookings"
          >
            <Text style={s.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.replace({
              pathname: '/(tabs)',
              params: {
                recentCourtName:  params.courtName,
                recentTotal:      params.grandTotal,
                recentPlayers:    params.players ?? '1',
                recentDate:       params.date,
                recentStartTime:  params.startTime,
                recentEndTime:    params.endTime,
              },
            })}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Text style={s.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#fff' },
  confettiLayer:  { position: 'absolute', top: 0, left: 0, right: 0, height: 360, zIndex: 10, overflow: 'hidden' },
  container:      { padding: Spacing.lg, alignItems: 'center', alignSelf: 'center', width: '100%', maxWidth: 480 },
  checkWrap:      { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  headline:       { fontSize: 26, fontWeight: '900', color: Palette.grey900, textAlign: 'center', marginBottom: 6 },
  subline:        { fontSize: 14, color: Palette.grey600, textAlign: 'center', marginBottom: Spacing.lg },

  card:           { width: '100%', backgroundColor: Palette.grey50, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Palette.grey200 },
  detailRow:      { paddingVertical: Spacing.sm },
  detailRowBorder:{ borderTopWidth: 1, borderTopColor: Palette.grey200 },
  detailLabel:    { fontSize: 12, color: Palette.grey500, marginBottom: 2 },
  detailValue:    { fontSize: 14, color: Palette.grey900, fontWeight: '600' },
  bookingIdText:  { color: Palette.primary, fontFamily: 'monospace' },

  tipsCard:       { width: '100%', backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.xs },
  tipsTitle:      { fontSize: 13, fontWeight: '700', color: Palette.primary, marginBottom: 4 },
  tipText:        { fontSize: 13, color: Palette.grey700 },

  actions:        { width: '100%', gap: Spacing.sm },
  qrBtn:          { backgroundColor: '#F3E5F5', borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#8E44AD' },
  qrBtnText:      { color: '#8E44AD', fontSize: 15, fontWeight: '800' },
  primaryBtn:     { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn:   { borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText:{ color: Palette.primary, fontSize: 16, fontWeight: '600' },
});
