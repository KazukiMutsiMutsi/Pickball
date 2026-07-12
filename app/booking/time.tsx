import { Palette, Radius, Spacing } from '@/constants/theme';
import { getBookingsForSlot } from '@/src/booking/bookingStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Every hour from 6 AM to midnight
const ALL_SLOTS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00',
];

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

type SlotState = 'free' | 'booked' | 'selected' | 'in-range' | 'past';

export default function SelectTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; price: string; date: string;
  }>();

  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [endSlot,   setEndSlot]   = useState<string | null>(null);

  const pricePerHour = parseFloat(params.price ?? '0');

  // Same-day: block past slots
  const todayISO = new Date().toISOString().slice(0, 10);
  const isToday  = params.date === todayISO;
  const nowMins  = isToday ? new Date().getHours() * 60 + new Date().getMinutes() + 60 : 0;

  // Build booked ranges from store
  const bookedRanges = useMemo(() => {
    const list = getBookingsForSlot(params.courtId, params.date);
    return list.map(b => ({ start: toMins(b.startTime), end: toMins(b.endTime) }));
  }, [params.courtId, params.date]);

  const isBooked = (t: string) => {
    const m = toMins(t);
    return bookedRanges.some(r => m >= r.start && m < r.end);
  };

  // Determine state of each slot
  const slotState = (t: string): SlotState => {
    const m = toMins(t);
    if (isToday && m < nowMins)       return 'past';
    if (isBooked(t))                  return 'booked';
    if (t === startSlot)              return 'selected';
    if (startSlot && endSlot) {
      const sm = toMins(startSlot);
      const em = toMins(endSlot);
      if (m > sm && m <= em)          return 'in-range';
    }
    return 'free';
  };

  // Tap logic:
  // - No start yet → set as start
  // - Has start, no end → if after start and not booked → set as end
  // - Anything else → reset and set as new start
  const handleTap = (t: string) => {
    const state = slotState(t);
    if (state === 'past' || state === 'booked') return;

    if (!startSlot) {
      setStartSlot(t); setEndSlot(null); return;
    }
    if (startSlot && !endSlot) {
      if (toMins(t) > toMins(startSlot)) {
        // Check no booked slot in range
        const blocked = ALL_SLOTS.some(s => {
          const sm = toMins(s);
          return sm >= toMins(startSlot) && sm < toMins(t) && isBooked(s);
        });
        if (!blocked) { setEndSlot(t); return; }
      }
    }
    // Reset
    setStartSlot(t); setEndSlot(null);
  };

  const duration = useMemo(() => {
    if (!startSlot || !endSlot) return 0;
    return (toMins(endSlot) - toMins(startSlot)) / 60;
  }, [startSlot, endSlot]);

  const total = pricePerHour * duration;
  const canContinue = !!startSlot && !!endSlot && duration > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    // endTime = endSlot (already the end hour)
    router.push({
      pathname: '/booking/summary',
      params: {
        ...params,
        startTime: startSlot!,
        endTime:   endSlot!,
        duration:  String(duration),
        total:     String(total),
      },
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={s.progress}>
        {[0, 1, 2].map(i => (
          <React.Fragment key={i}>
            <View style={[s.dot, i === 0 && s.dotActive]} />
            {i < 2 && <View style={s.line} />}
          </React.Fragment>
        ))}
      </View>
      <View style={s.progressLabels}>
        {['Time', 'Summary', 'Payment'].map((label, i) => (
          <Text key={label} style={[s.progressLabel, i === 0 && s.progressLabelActive]}>
            {label}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Court + date */}
        <Text style={s.courtName}>{params.courtName}</Text>
        <Text style={s.dateLabel}>📅 {formatDate(params.date)}</Text>

        {/* Legend */}
        <View style={s.legend}>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#E8F5E9' }]} /><Text style={s.legendText}>Free</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#FFEBEE' }]} /><Text style={s.legendText}>Booked</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Palette.primary }]} /><Text style={s.legendText}>Selected</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Palette.primaryLight }]} /><Text style={s.legendText}>Range</Text></View>
        </View>

        {/* Instruction */}
        <Text style={s.instruction}>
          {!startSlot
            ? '👆 Tap a slot to set your start time'
            : !endSlot
            ? '👆 Now tap a later slot to set your end time'
            : `✅ ${to12h(startSlot)} → ${to12h(endSlot)}`}
        </Text>

        {/* Slot list */}
        <View style={s.slotList}>
          {ALL_SLOTS.map((t, idx) => {
            const st = slotState(t);
            const isStart   = t === startSlot;
            const isEnd     = t === endSlot;
            const isInRange = st === 'in-range';
            const isFirst   = idx === 0;
            const isLast    = idx === ALL_SLOTS.length - 1;

            return (
              <TouchableOpacity
                key={t}
                style={[
                  s.slot,
                  isFirst && s.slotFirst,
                  isLast  && s.slotLast,
                  st === 'free'     && s.slotFree,
                  st === 'booked'   && s.slotBooked,
                  st === 'past'     && s.slotPast,
                  isStart           && s.slotStart,
                  isEnd             && s.slotEnd,
                  isInRange         && s.slotRange,
                ]}
                onPress={() => handleTap(t)}
                disabled={st === 'past' || st === 'booked'}
                accessibilityRole="button"
                accessibilityLabel={`${to12h(t)} ${st}`}
                accessibilityState={{ selected: isStart || isEnd }}
              >
                {/* Left time label */}
                <Text style={[
                  s.slotTime,
                  (isStart || isEnd) && s.slotTimeSelected,
                  isInRange          && s.slotTimeRange,
                  st === 'booked'    && s.slotTimeBooked,
                  st === 'past'      && s.slotTimePast,
                ]}>
                  {to12h(t)}
                </Text>

                {/* Right badge */}
                <View style={s.slotBadgeWrap}>
                  {isStart && (
                    <View style={[s.badge, s.badgeStart]}>
                      <Text style={s.badgeText}>Start</Text>
                    </View>
                  )}
                  {isEnd && (
                    <View style={[s.badge, s.badgeEnd]}>
                      <Text style={s.badgeText}>End</Text>
                    </View>
                  )}
                  {!isStart && !isEnd && st === 'free' && (
                    <Text style={s.slotStatusFree}>Free</Text>
                  )}
                  {!isStart && !isEnd && st === 'booked' && (
                    <Text style={s.slotStatusBooked}>Booked</Text>
                  )}
                  {!isStart && !isEnd && isInRange && (
                    <Text style={s.slotStatusRange}>✓</Text>
                  )}
                  {st === 'past' && (
                    <Text style={s.slotStatusPast}>Past</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary */}
        {canContinue && (
          <View style={s.summaryBox}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Time</Text>
              <Text style={s.summaryValue}>{to12h(startSlot!)} – {to12h(endSlot!)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Duration</Text>
              <Text style={s.summaryValue}>{duration} hr{duration !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[s.summaryRow, s.summaryRowTotal]}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryTotal}>₱{total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.continueBtn, !canContinue && s.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue to booking summary"
        >
          <Text style={s.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn:             { width: 40 },
  backIcon:            { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:               { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  // Progress
  progress:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  dot:                 { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  dotActive:           { backgroundColor: Palette.primary },
  line:                { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  progressLabels:      { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200, maxWidth: 480, alignSelf: 'center', width: '100%' },
  progressLabel:       { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  // Body
  body:                { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },
  courtName:           { fontSize: 17, fontWeight: '800', color: Palette.grey900 },
  dateLabel:           { fontSize: 13, color: Palette.grey600, marginTop: 4, marginBottom: Spacing.md },

  // Legend
  legend:              { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  legendItem:          { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:           { width: 12, height: 12, borderRadius: 3 },
  legendText:          { fontSize: 11, color: Palette.grey600 },

  // Instruction
  instruction:         { fontSize: 13, color: Palette.grey700, fontWeight: '600', marginBottom: Spacing.md, backgroundColor: Palette.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm },

  // Slot list
  slotList:            { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Palette.grey200 },
  slot:                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  slotFirst:           { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  slotLast:            { borderBottomWidth: 0, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg },
  slotFree:            { backgroundColor: '#E8F5E9' },
  slotBooked:          { backgroundColor: '#FFEBEE' },
  slotPast:            { backgroundColor: Palette.grey100 },
  slotStart:           { backgroundColor: Palette.primary },
  slotEnd:             { backgroundColor: Palette.primaryDark },
  slotRange:           { backgroundColor: Palette.primaryLight },

  slotTime:            { fontSize: 15, fontWeight: '700', color: Palette.grey900 },
  slotTimeSelected:    { color: '#fff' },
  slotTimeRange:       { color: Palette.primary },
  slotTimeBooked:      { color: '#EF5350' },
  slotTimePast:        { color: Palette.grey400 },

  slotBadgeWrap:       { flexDirection: 'row', alignItems: 'center' },
  badge:               { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  badgeStart:          { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeEnd:            { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText:           { fontSize: 11, fontWeight: '700', color: '#fff' },

  slotStatusFree:      { fontSize: 12, color: '#43A047', fontWeight: '600' },
  slotStatusBooked:    { fontSize: 12, color: '#EF5350', fontWeight: '600' },
  slotStatusRange:     { fontSize: 14, color: Palette.primary, fontWeight: '700' },
  slotStatusPast:      { fontSize: 12, color: Palette.grey400 },

  // Summary
  summaryBox:          { marginTop: Spacing.lg, backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.md },
  summaryRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  summaryRowTotal:     { marginBottom: 0, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: 'rgba(26,143,227,0.2)', marginTop: Spacing.xs },
  summaryLabel:        { fontSize: 13, color: Palette.grey600 },
  summaryValue:        { fontSize: 13, color: Palette.grey900, fontWeight: '600' },
  summaryTotal:        { fontSize: 16, color: Palette.primary, fontWeight: '800' },

  // Footer
  footer:              { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  continueBtn:         { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Palette.grey300 },
  continueBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
