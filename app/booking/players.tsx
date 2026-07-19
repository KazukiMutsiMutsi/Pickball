import { Palette, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const SERVICE_FEE_RATE = 0.05;

// ─── Checkbox row ─────────────────────────────────────────────────────────────
function CheckRow({
  checked, onToggle, label, sublabel,
}: { checked: boolean; onToggle: () => void; label: string; sublabel: string }) {
  return (
    <TouchableOpacity
      style={s.checkRow}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[s.checkbox, checked && s.checkboxChecked]}>
        {checked && <Text style={s.checkMark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.checkLabel}>{label}</Text>
        <Text style={s.checkSub}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function PlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; price: string;
    date: string; startTime: string; endTime: string;
    duration: string; total: string; holdId?: string;
  }>();

  const [players, setPlayers] = useState(2);
  const [agreePrivacy,  setAgreePrivacy]  = useState(false);
  const [agreeTerms,    setAgreeTerms]    = useState(false);
  const [agreeRefund,   setAgreeRefund]   = useState(false);

  const allChecked = agreePrivacy && agreeTerms && agreeRefund;

  const subtotal   = parseFloat(params.total ?? '0');
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const grandTotal = subtotal + serviceFee;

  const handleConfirm = () => {
    if (!allChecked) return;
    router.push({
      pathname: '/booking/summary',
      params: {
        ...params,
        players:    String(players),
        serviceFee: String(serviceFee),
        grandTotal: String(grandTotal),
      },
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Progress ── */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          {['Time', 'Players', 'Payment'].map((label, i) => (
            <React.Fragment key={label}>
              <View style={s.progressStep}>
                <View style={[s.progressDot, i <= 1 && s.progressDotActive]}>
                  <Text style={[s.progressDotNum, i <= 1 && s.progressDotNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[s.progressLabel, i <= 1 && s.progressLabelActive]}>{label}</Text>
              </View>
              {i < 2 && <View style={[s.progressLine, i < 1 && s.progressLineDone]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Player count ── */}
        <Animated.View entering={FadeInDown.duration(280)} style={s.section}>
          {params.holdId ? (
            <View style={s.holdBanner}>
              <Text style={s.holdBannerText}>
                Slot held as Pending · {to12h(params.startTime)} – {to12h(params.endTime)}. Confirm payment to book it.
              </Text>
            </View>
          ) : null}
          <Text style={s.sectionTitle}>How many players?</Text>
          <Text style={s.sectionSub}>Including yourself</Text>

          <View style={s.counterRow}>
            <Animated.View key={players} entering={ZoomIn.duration(150)} style={s.counterVal}>
              <Text style={s.counterNum}>{players}</Text>
              <Text style={s.counterUnit}>player{players !== 1 ? 's' : ''}</Text>
            </Animated.View>
          </View>

          {/* Quick presets */}
          <View style={s.presets}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <TouchableOpacity
                key={n}
                style={[s.preset, players === n && s.presetOn]}
                onPress={() => setPlayers(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n}`}
              >
                <Text style={[s.presetText, players === n && s.presetTextOn]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Booking summary ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={s.section}>
          <Text style={s.sectionTitle}>Booking Summary</Text>

          <View style={s.summaryCard}>
            {/* Court */}
            <View style={s.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryCourtName}>{params.courtName}</Text>
                <Text style={s.summaryCourtSub}>Pickleball Court</Text>
              </View>
            </View>

            <View style={s.summaryDivider} />

            {/* Details */}
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Date</Text>
              <Text style={s.summaryDetailValue}>{formatDate(params.date)}</Text>
            </View>
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Time</Text>
              <Text style={s.summaryDetailValue}>{to12h(params.startTime)} – {to12h(params.endTime)}</Text>
            </View>
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Duration</Text>
              <Text style={s.summaryDetailValue}>{params.duration} hr{parseFloat(params.duration) !== 1 ? 's' : ''}</Text>
            </View>
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Players</Text>
              <Text style={s.summaryDetailValue}>{players} player{players !== 1 ? 's' : ''}</Text>
            </View>

            <View style={s.summaryDivider} />

            {/* Price breakdown */}
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Court rental</Text>
              <Text style={s.summaryDetailValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={s.summaryDetail}>
              <Text style={s.summaryDetailLabel}>Service fee (5%)</Text>
              <Text style={s.summaryDetailValue}>₱{serviceFee.toFixed(2)}</Text>
            </View>

            <View style={s.summaryDivider} />

            <View style={s.summaryDetail}>
              <Text style={s.summaryTotalLabel}>Total</Text>
              <Text style={s.summaryTotalValue}>₱{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Agreements ── */}
        <Animated.View entering={FadeInDown.delay(160).duration(280)} style={s.section}>
          <Text style={s.sectionTitle}>Agreements</Text>
          <Text style={s.sectionSub}>Please read and accept all policies to proceed</Text>

          <View style={s.checkCard}>
            <CheckRow
              checked={agreePrivacy}
              onToggle={() => setAgreePrivacy(v => !v)}
              label="Privacy Policy"
              sublabel="I agree that my personal information will be collected and used to process this booking in accordance with the Privacy Policy."
            />
            <View style={s.checkDivider} />
            <CheckRow
              checked={agreeTerms}
              onToggle={() => setAgreeTerms(v => !v)}
              label="Terms & Agreement"
              sublabel="I have read and agree to the Terms & Conditions governing court usage, booking rules, and user conduct."
            />
            <View style={s.checkDivider} />
            <CheckRow
              checked={agreeRefund}
              onToggle={() => setAgreeRefund(v => !v)}
              label="No Refund Policy"
              sublabel="I understand that all bookings are final. No refunds will be issued once the booking is confirmed."
            />
          </View>
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Confirm button ── */}
      <View style={s.footer}>
        {!allChecked && (
          <Text style={s.footerHint}>Accept all 3 agreements to confirm</Text>
        )}
        <TouchableOpacity
          style={[s.confirmBtn, !allChecked && s.confirmBtnOff]}
          onPress={handleConfirm}
          disabled={!allChecked}
          accessibilityRole="button"
          accessibilityLabel="Confirm booking"
        >
          <Text style={s.confirmBtnText}>
            {allChecked ? `Confirm Booking  ·  ₱${grandTotal.toFixed(2)}` : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  backBtn:     { width: 40 },
  backIcon:    { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:       { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },

  progressWrap:         { backgroundColor: '#fff', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  progressTrack:        { flexDirection: 'row', alignItems: 'center' },
  progressStep:         { alignItems: 'center', gap: 4 },
  progressDot:          { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  progressDotActive:    { backgroundColor: Palette.primary },
  progressDotNum:       { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  progressDotNumActive: { color: '#fff' },
  progressLabel:        { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  progressLabelActive:  { color: Palette.primary },
  progressLine:         { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginBottom: 14 },
  progressLineDone:     { backgroundColor: Palette.primary },

  body:        { padding: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },

  // Section wrapper
  section:       { marginBottom: Spacing.lg },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  sectionSub:    { fontSize: 12, color: '#64748B', marginBottom: Spacing.md },
  holdBanner:    { backgroundColor: '#FFF7ED', borderRadius: 12, padding: Spacing.sm, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: '#F97316' },
  holdBannerText:{ fontSize: 12, color: '#C2410C', fontWeight: '600', lineHeight: 17 },

  // Counter
  counterRow:   { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  counterVal:   { alignItems: 'center', minWidth: 80 },
  counterNum:   { fontSize: 44, fontWeight: '900', color: '#0F172A', lineHeight: 48 },
  counterUnit:  { fontSize: 12, color: '#64748B', fontWeight: '600' },

  presets:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  preset:      { width: 48, height: 48, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  presetOn:    { backgroundColor: Palette.primaryLight, borderColor: Palette.primary },
  presetText:  { fontSize: 17, fontWeight: '800', color: '#64748B' },
  presetTextOn:{ color: Palette.primary },

  // Booking summary card
  summaryCard:        { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  summaryRow:         { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  summaryIconWrap:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  summaryIcon:        { fontSize: 22 },
  summaryCourtName:   { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  summaryCourtSub:    { fontSize: 12, color: '#64748B', marginTop: 1 },
  summaryDivider:     { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: Spacing.md },
  summaryDetail:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  summaryDetailLabel: { fontSize: 13, color: '#64748B' },
  summaryDetailValue: { fontSize: 13, color: '#0F172A', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  summaryTotalLabel:  { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  summaryTotalValue:  { fontSize: 18, fontWeight: '900', color: Palette.primary },

  // Agreements
  checkCard:    { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  checkRow:     { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: 12 },
  checkDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: Spacing.md },
  checkbox:     { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  checkMark:    { color: '#fff', fontSize: 13, fontWeight: '900' },
  checkLabel:   { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  checkSub:     { fontSize: 12, color: '#64748B', lineHeight: 17 },

  // Footer
  footer:         { padding: Spacing.md, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff', gap: 6 },
  footerHint:     { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  confirmBtn:     { backgroundColor: Palette.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  confirmBtnOff:  { backgroundColor: '#CBD5E1' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});
