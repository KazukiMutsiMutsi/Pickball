import { Palette, Radius, Spacing } from '@/constants/theme';
import { getBookingsForSlot } from '@/src/booking/bookingStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_SLOTS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00',
];

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
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

type SlotState = 'free' | 'booked' | 'start' | 'end' | 'range' | 'past';

export default function SelectTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courtId: string; courtName: string; price: string; date: string;
  }>();

  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [endSlot,   setEndSlot]   = useState<string | null>(null);

  const pricePerHour = parseFloat(params.price ?? '0');
  const todayISO     = new Date().toISOString().slice(0, 10);
  const isToday      = params.date === todayISO;
  const nowMins      = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  const bookedRanges = useMemo(() => {
    return getBookingsForSlot(params.courtId, params.date)
      .map(b => ({ start: toMins(b.startTime), end: toMins(b.endTime) }));
  }, [params.courtId, params.date]);

  const isBooked = (t: string) => {
    const m = toMins(t);
    return bookedRanges.some(r => m >= r.start && m < r.end);
  };

  const slotState = (t: string): SlotState => {
    const m = toMins(t);
    if (isToday && m <= nowMins) return 'past';
    if (isBooked(t))            return 'booked';
    if (t === startSlot)        return 'start';
    if (t === endSlot)          return 'end';
    if (startSlot && endSlot) {
      const sm = toMins(startSlot), em = toMins(endSlot);
      if (m > sm && m < em)     return 'range';
    }
    return 'free';
  };

  const handleTap = (t: string) => {
    const st = slotState(t);
    if (st === 'past' || st === 'booked') return;
    if (!startSlot) { setStartSlot(t); setEndSlot(null); return; }
    if (startSlot && !endSlot && toMins(t) > toMins(startSlot)) {
      const blocked = ALL_SLOTS.some(s => {
        const sm = toMins(s);
        return sm >= toMins(startSlot) && sm < toMins(t) && isBooked(s);
      });
      if (!blocked) { setEndSlot(t); return; }
    }
    setStartSlot(t); setEndSlot(null);
  };

  const duration   = useMemo(() => (!startSlot || !endSlot) ? 0 : (toMins(endSlot) - toMins(startSlot)) / 60, [startSlot, endSlot]);
  const total      = pricePerHour * duration;
  const canContinue = !!startSlot && !!endSlot && duration > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({ pathname: '/booking/summary', params: { ...params, startTime: startSlot!, endTime: endSlot!, duration: String(duration), total: String(total) } });
  };

  const slotAppearance = (st: SlotState) => {
    switch (st) {
      case 'free':   return { bg: '#E8F5E9', labelColor: '#43A047', label: 'Free',   timeColor: '#1a1a1a' };
      case 'booked': return { bg: '#FFEBEE', labelColor: '#EF5350', label: 'Booked', timeColor: '#1a1a1a' };
      case 'past':   return { bg: '#F1F5F9', labelColor: '#94A3B8', label: 'Past',   timeColor: '#94A3B8' };
      case 'start':  return { bg: Palette.primary, labelColor: '#fff', label: 'Start', timeColor: '#fff'  };
      case 'end':    return { bg: Palette.primaryDark, labelColor: '#fff', label: 'End', timeColor: '#fff' };
      case 'range':  return { bg: '#BBDEFB', labelColor: Palette.primary, label: '✓',  timeColor: '#1a1a1a' };
    }
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
          <Text key={label} style={[s.progressLabel, i === 0 && s.progressLabelActive]}>{label}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        <Text style={s.courtName}>{params.courtName}</Text>
        <Text style={s.dateLabel}>📅 {formatDate(params.date)}</Text>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { bg: '#E8F5E9', label: 'Available' },
            { bg: '#FFEBEE', label: 'Booked'    },
            { bg: Palette.primary, label: 'Selected' },
            { bg: Palette.grey100, label: 'Past'     },
          ].map(l => (
            <View key={l.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: l.bg }]} />
              <Text style={s.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Instruction */}
        <Text style={s.instruction}>
          {!startSlot ? '👆 Tap a slot to set your start time'
           : !endSlot ? '👆 Now tap a later slot to set your end time'
           : `✅ ${to12h(startSlot)} → ${to12h(endSlot)}`}
        </Text>

        {/* 3-column slot grid — rendered as rows */}
        <Text style={s.sectionLabel}>Time Slot</Text>
        {Array.from({ length: Math.ceil(ALL_SLOTS.length / 3) }, (_, rowIdx) => (
          <View key={rowIdx} style={s.gridRow}>
            {ALL_SLOTS.slice(rowIdx * 3, rowIdx * 3 + 3).map(t => {
              const st       = slotState(t);
              const app      = slotAppearance(st);
              const disabled = st === 'past' || st === 'booked';
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.slot, { backgroundColor: app.bg }, (st === 'start' || st === 'end') && s.slotSelected]}
                  onPress={() => handleTap(t)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`${to12h(t)} ${app.label}`}
                  accessibilityState={{ disabled, selected: st === 'start' || st === 'end' }}
                >
                  <Text style={[s.slotTime, { color: app.timeColor }]}>{to12h(t)}</Text>
                  {(st === 'start' || st === 'end') ? (
                    <Animated.Text entering={ZoomIn.duration(200)} style={[s.slotLabel, { color: app.labelColor }]}>
                      {app.label}
                    </Animated.Text>
                  ) : (
                    <Text style={[s.slotLabel, { color: app.labelColor }]}>{app.label}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Fill empty cells in last row */}
            {ALL_SLOTS.slice(rowIdx * 3, rowIdx * 3 + 3).length < 3 &&
              Array.from({ length: 3 - ALL_SLOTS.slice(rowIdx * 3, rowIdx * 3 + 3).length }, (_, i) => (
                <View key={`empty-${i}`} style={s.slotEmpty} />
              ))
            }
          </View>
        ))}

        {/* Summary */}
        {canContinue && (
          <Animated.View entering={FadeInUp.duration(350).springify()} style={s.summaryBox}>
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
          </Animated.View>
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
        >
          <Text style={s.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#F8FAFC' },
  header:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn:             { width: 40 },
  backIcon:            { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:               { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  progress:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  dot:                 { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  dotActive:           { backgroundColor: Palette.primary },
  line:                { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  progressLabels:      { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200, maxWidth: 480, alignSelf: 'center', width: '100%' },
  progressLabel:       { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },
  body:                { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },
  courtName:           { fontSize: 17, fontWeight: '800', color: Palette.grey900 },
  dateLabel:           { fontSize: 13, color: Palette.grey600, marginTop: 4, marginBottom: Spacing.md },
  legend:              { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  legendItem:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:           { width: 10, height: 10, borderRadius: 3 },
  legendText:          { fontSize: 11, color: Palette.grey600 },
  instruction:         { fontSize: 13, color: Palette.grey700, fontWeight: '600', marginBottom: Spacing.md, backgroundColor: Palette.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm },
  sectionLabel:        { fontSize: 14, fontWeight: '800', color: Palette.primary, marginBottom: Spacing.md },

  // 3-column grid rows
  gridRow:             { flexDirection: 'row', gap: 12, marginBottom: 12 },
  slot:                { flex: 1, paddingVertical: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  slotSelected:        { borderColor: Palette.primary },
  slotEmpty:           { flex: 1 },
  slotTime:            { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 5 },
  slotLabel:           { fontSize: 13, fontWeight: '700' },

  summaryBox:          { marginTop: Spacing.lg, backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.md },
  summaryRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  summaryRowTotal:     { marginBottom: 0, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: 'rgba(26,143,227,0.2)', marginTop: Spacing.xs },
  summaryLabel:        { fontSize: 13, color: Palette.grey600 },
  summaryValue:        { fontSize: 13, color: Palette.grey900, fontWeight: '600' },
  summaryTotal:        { fontSize: 16, color: Palette.primary, fontWeight: '800' },
  footer:              { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  continueBtn:         { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Palette.grey300 },
  continueBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
