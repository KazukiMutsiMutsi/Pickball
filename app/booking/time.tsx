import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  createPendingHold,
  getBookingsForSlot,
  getPendingHoldsForSlot,
  getSessionHoldId,
  purgeExpiredHolds,
} from '@/src/booking/bookingStore';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_SLOTS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00','00:00',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  // treat midnight (00:xx) as hour 24 so it sorts after 23:xx
  return (h === 0 ? 24 : h) * 60 + m;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

type SlotState = 'free' | 'booked' | 'pending' | 'start' | 'end' | 'range' | 'past';

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SelectTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; price: string; date: string;
    holdId?: string;
  }>();

  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [endSlot,   setEndSlot]   = useState<string | null>(null);
  const [tick, setTick] = useState(0); // refresh slot status on focus

  const pricePerHour = parseFloat(params.price ?? '0');
  const todayISO     = new Date().toISOString().slice(0, 10);
  const isToday      = params.date === todayISO;
  const nowMins      = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  useFocusEffect(
    useCallback(() => {
      // Refresh booked/pending UI; holds expire after HOLD_TTL_MS
      purgeExpiredHolds();
      setTick(t => t + 1);
    }, []),
  );

  const bookedRanges = useMemo(() => {
    return getBookingsForSlot(params.courtId, params.date)
      .map(b => ({ start: toMins(b.startTime), end: toMins(b.endTime) }));
  }, [params.courtId, params.date, tick]);

  const pendingRanges = useMemo(() => {
    return getPendingHoldsForSlot(params.courtId, params.date)
      .map(h => ({ start: toMins(h.startTime), end: toMins(h.endTime), id: h.id }));
  }, [params.courtId, params.date, tick]);

  const isBooked = (t: string) => {
    const m = toMins(t);
    return bookedRanges.some(r => m >= r.start && m < r.end);
  };

  const isPending = (t: string) => {
    const m = toMins(t);
    return pendingRanges.some(r => m >= r.start && m < r.end);
  };

  const slotState = (t: string): SlotState => {
    const m = toMins(t);
    if (isToday && t !== '00:00' && m <= nowMins) return 'past';
    if (isBooked(t))            return 'booked';
    // Selected range wins over pending while picking on this screen
    if (t === startSlot)        return 'start';
    if (t === endSlot)          return 'end';
    if (startSlot && endSlot) {
      const sm = toMins(startSlot), em = toMins(endSlot);
      if (m > sm && m < em)     return 'range';
    }
    if (isPending(t))           return 'pending';
    return 'free';
  };

  const handleTap = (t: string) => {
    const st = slotState(t);
    if (st === 'past' || st === 'booked' || st === 'pending') return;
    if (!startSlot) { setStartSlot(t); setEndSlot(null); return; }
    if (startSlot && !endSlot && toMins(t) > toMins(startSlot)) {
      const blocked = ALL_SLOTS.some(s => {
        const sm = toMins(s);
        return sm >= toMins(startSlot) && sm < toMins(t) && (isBooked(s) || isPending(s));
      });
      if (!blocked) { setEndSlot(t); return; }
    }
    setStartSlot(t); setEndSlot(null);
  };

  const duration    = useMemo(() => (!startSlot || !endSlot) ? 0 : (toMins(endSlot) - toMins(startSlot)) / 60, [startSlot, endSlot]);
  const total       = pricePerHour * duration;
  const canContinue = !!startSlot && !!endSlot && duration > 0;

  const handleContinue = () => {
    if (!canContinue || !startSlot || !endSlot) return;
    const hold = createPendingHold(
      params.courtId,
      params.date,
      startSlot,
      endSlot,
      (typeof params.holdId === 'string' ? params.holdId : undefined) ?? getSessionHoldId() ?? undefined,
    );
    if (!hold) {
      Alert.alert(
        'Slot unavailable',
        'This time was just taken or is pending. Please choose another slot.',
      );
      setTick(t => t + 1);
      setStartSlot(null);
      setEndSlot(null);
      return;
    }
    router.push({
      pathname: '/booking/players',
      params: {
        ...params,
        startTime: startSlot,
        endTime: endSlot,
        duration: String(duration),
        total: String(total),
        holdId: hold.id,
      },
    });
  };

  const slotAppearance = (st: SlotState) => {
    switch (st) {
      case 'free':    return { bg: '#F0FDF4', border: '#86EFAC', label: 'Free',    labelColor: '#16A34A', timeColor: '#166534' };
      case 'booked':  return { bg: '#FEF2F2', border: '#FCA5A5', label: 'Booked',  labelColor: '#DC2626', timeColor: '#9B1C1C' };
      case 'pending': return { bg: '#FFF7ED', border: '#FDBA74', label: 'Pending', labelColor: '#EA580C', timeColor: '#C2410C' };
      case 'past':    return { bg: '#F8FAFC', border: '#E2E8F0', label: 'Past',    labelColor: '#94A3B8', timeColor: '#94A3B8' };
      case 'start':   return { bg: Palette.primary, border: Palette.primary, label: 'Start', labelColor: '#fff', timeColor: '#fff' };
      case 'end':     return { bg: '#0D6EAB', border: '#0D6EAB', label: 'End',   labelColor: '#fff', timeColor: '#fff' };
      case 'range':   return { bg: '#DBEAFE', border: '#93C5FD', label: 'Selected', labelColor: Palette.primary, timeColor: '#1E40AF' };
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Book a Slot</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Progress ── */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          {['Time', 'Players', 'Payment'].map((label, i) => (
            <React.Fragment key={label}>
              <View style={s.progressStep}>
                <View style={[s.progressDot, i === 0 && s.progressDotActive]}>
                  <Text style={[s.progressDotNum, i === 0 && s.progressDotNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[s.progressLabel, i === 0 && s.progressLabelActive]}>{label}</Text>
              </View>
              {i < 2 && <View style={[s.progressLine, i === 0 && s.progressLineDone]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Legend ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(300)} style={s.legend}>
          {[
            { bg: '#F0FDF4', border: '#86EFAC', label: 'Available' },
            { bg: '#FFF7ED', border: '#FDBA74', label: 'Pending'   },
            { bg: '#FEF2F2', border: '#FCA5A5', label: 'Booked'    },
            { bg: Palette.primary, border: Palette.primary, label: 'Selected' },
            { bg: '#F8FAFC', border: '#E2E8F0', label: 'Past'      },
          ].map(l => (
            <View key={l.label} style={s.legendItem}>
              <View style={[s.legendSwatch, { backgroundColor: l.bg, borderColor: l.border }]} />
              <Text style={s.legendText}>{l.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Instruction banner ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(300)} style={s.instructionBanner}>
          <Text style={s.instructionText}>
            {!startSlot
              ? 'Tap a slot to set your start time'
              : !endSlot
              ? 'Now tap a later slot for your end time'
              : `${to12h(startSlot)} → ${to12h(endSlot)}`}
          </Text>
        </Animated.View>

        {/* ── Time slots (full-width column) ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Time Slots</Text>
        </View>

        <View style={s.slotsColumn}>
          {ALL_SLOTS.map((t, idx) => {
            const st       = slotState(t);
            const app      = slotAppearance(st);
            const disabled = st === 'past' || st === 'booked' || st === 'pending';
            const isActive = st === 'start' || st === 'end' || st === 'range';

            return (
              <TouchableOpacity
                key={t}
                style={[
                  s.slotRow,
                  { backgroundColor: app.bg, borderColor: app.border },
                  isActive && s.slotRowActive,
                  idx === 0 && s.slotRowFirst,
                  idx === ALL_SLOTS.length - 1 && s.slotRowLast,
                ]}
                onPress={() => handleTap(t)}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
                accessibilityRole="button"
                accessibilityLabel={`${to12h(t)} ${app.label}`}
                accessibilityState={{ disabled, selected: isActive }}
              >
                {/* Time column */}
                <View style={s.slotTimeCol}>
                  <Text style={[s.slotTime, { color: app.timeColor }]}>{to12h(t)}</Text>
                  <Text style={s.slotDuration}>1 hr slot</Text>
                </View>

                {/* Divider */}
                <View style={[s.slotDivider, { backgroundColor: app.border }]} />

                {/* Status */}
                <View style={s.slotStatusCol}>
                  {(st === 'start' || st === 'end') ? (
                    <Animated.View entering={ZoomIn.duration(200)} style={[s.slotBadge, { backgroundColor: app.labelColor === '#fff' ? 'rgba(255,255,255,0.25)' : app.bg }]}>
                      <Text style={[s.slotBadgeText, { color: app.labelColor }]}>{app.label}</Text>
                    </Animated.View>
                  ) : (
                    <View style={[s.slotBadge, { backgroundColor: disabled ? 'transparent' : 'rgba(0,0,0,0.04)' }]}>
                      <Text style={[s.slotBadgeText, { color: app.labelColor }]}>{app.label}</Text>
                    </View>
                  )}
                </View>

                {/* Right indicator */}
                {!disabled && (
                  <View style={[s.slotArrow, isActive && { opacity: 1 }]}>
                    {st === 'free' && <Text style={{ fontSize: 16, color: '#94A3B8' }}>›</Text>}
                    {st === 'range' && <Text style={{ fontSize: 16, color: Palette.primary }}>✓</Text>}
                    {(st === 'start' || st === 'end') && <Text style={{ fontSize: 16, color: '#fff' }}>✓</Text>}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Booking summary ── */}
        {canContinue && (
          <Animated.View entering={FadeInUp.duration(350).springify()} style={s.summaryBox}>
            <Text style={s.summaryTitle}>Booking Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Court</Text>
              <Text style={s.summaryValue}>{params.courtName}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Date</Text>
              <Text style={s.summaryValue}>{formatDate(params.date ?? todayISO)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Time</Text>
              <Text style={s.summaryValue}>{to12h(startSlot!)} – {to12h(endSlot!)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Duration</Text>
              <Text style={s.summaryValue}>{duration} hr{duration !== 1 ? 's' : ''}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryTotalLabel}>Total</Text>
              <Text style={s.summaryTotal}>₱{total.toFixed(2)}</Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.continueBtn, !canContinue && s.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue to summary"
        >
          <Text style={s.continueBtnText}>
            {canContinue ? `Continue  →  ₱${total.toFixed(2)}` : 'Select time to continue'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  backBtn:      { width: 40 },
  backIcon:     { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:        { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },

  // Progress
  progressWrap:         { backgroundColor: '#fff', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  progressTrack:        { flexDirection: 'row', alignItems: 'center' },
  progressStep:         { alignItems: 'center', gap: 4 },
  progressDot:          { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  progressDotActive:    { backgroundColor: Palette.primary },
  progressDotNum:       { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  progressDotNumActive: { color: '#fff' },
  progressLabel:        { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  progressLabelActive:  { color: Palette.primary },
  progressLine:         { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginBottom: 14 },
  progressLineDone:     { backgroundColor: Palette.primary },

  body:         { padding: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },

  // Section header
  sectionHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  sectionTitle:      { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  // Legend
  legend:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.sm },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legendText:   { fontSize: 11, color: '#64748B' },

  // Instruction
  instructionBanner: { backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Palette.primary },
  instructionText:   { fontSize: 13, color: '#1E40AF', fontWeight: '600' },

  // Slots column
  slotsColumn:     { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: Spacing.md },
  slotRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent', gap: 12 },
  slotRowFirst:    { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  slotRowLast:     { borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderBottomWidth: 0 },
  slotRowActive:   { borderWidth: 1.5 },
  slotTimeCol:     { width: 90 },
  slotTime:        { fontSize: 15, fontWeight: '700' },
  slotDuration:    { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  slotDivider:     { width: 1, height: 36, opacity: 0.3 },
  slotStatusCol:   { flex: 1 },
  slotBadge:       { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  slotBadgeText:   { fontSize: 12, fontWeight: '700' },
  slotArrow:       { opacity: 0.5 },

  // Summary box
  summaryBox:        { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryTitle:      { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.sm },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel:      { fontSize: 13, color: '#64748B' },
  summaryValue:      { fontSize: 13, color: '#0F172A', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryDivider:    { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  summaryTotal:      { fontSize: 18, fontWeight: '900', color: Palette.primary },

  // Footer
  footer:            { padding: Spacing.md, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff' },
  continueBtn:       { backgroundColor: Palette.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { backgroundColor: '#CBD5E1' },
  continueBtnText:   { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
