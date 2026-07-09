import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DURATIONS = [1, 1.5, 2, 2.5, 3];

const START_TIMES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30',
];

// Mock some unavailable slots
const UNAVAILABLE = new Set(['09:00', '09:30', '14:00', '18:00']);

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMins = h * 60 + m + hours * 60;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function SelectTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId: string; courtName: string; price: string; date: string }>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);

  const endTime = selectedTime ? addHours(selectedTime, duration) : null;
  const total = parseFloat(params.price ?? '0') * duration;

  const handleContinue = () => {
    if (!selectedTime || !endTime) return;
    router.push({
      pathname: '/booking/summary',
      params: {
        ...params,
        startTime: selectedTime,
        endTime,
        duration: String(duration),
        total: String(total),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <View style={[styles.dot, i <= 1 && styles.dotActive]} />
            {i < 3 && <View style={[styles.line, i < 1 && styles.lineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {['Date', 'Time', 'Summary', 'Payment'].map((s, i) => (
          <Text key={s} style={[styles.progressLabel, i <= 1 && styles.progressLabelActive]}>{s}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.courtName}>{params.courtName}</Text>
        <Text style={styles.dateLabel}>📅 {formatDate(params.date)}</Text>

        {/* Duration picker */}
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.durRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durChip, duration === d && styles.durChipActive]}
              onPress={() => setDuration(d)}
              accessibilityRole="button"
              accessibilityLabel={`${d} hour${d !== 1 ? 's' : ''}`}
            >
              <Text style={[styles.durText, duration === d && styles.durTextActive]}>
                {d}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time grid */}
        <Text style={styles.sectionTitle}>Start Time</Text>
        <View style={styles.timeGrid}>
          {START_TIMES.map((t) => {
            const unavail = UNAVAILABLE.has(t);
            const selected = selectedTime === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.timeSlot, selected && styles.timeSlotSelected, unavail && styles.timeSlotUnavail]}
                onPress={() => !unavail && setSelectedTime(t)}
                disabled={unavail}
                accessibilityRole="button"
                accessibilityLabel={unavail ? `${to12h(t)} unavailable` : to12h(t)}
              >
                <Text style={[styles.timeText, selected && styles.timeTextSelected, unavail && styles.timeTextUnavail]}>
                  {to12h(t)}
                </Text>
                {unavail && <Text style={styles.unavailDot}>✕</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedTime && endTime && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{to12h(selectedTime)} – {to12h(endTime)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{duration} hr{duration !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: Palette.primary, fontWeight: '700' }]}>${total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedTime && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedTime}
          accessibilityRole="button"
          accessibilityLabel="Continue to booking summary"
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn: { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  dotActive: { backgroundColor: Palette.primary },
  line: { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  lineActive: { backgroundColor: Palette.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressLabel: { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  body: { padding: Spacing.md },
  courtName: { fontSize: 16, fontWeight: '700', color: Palette.grey900 },
  dateLabel: { fontSize: 13, color: Palette.grey600, marginTop: 4, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.grey900, marginBottom: Spacing.sm, marginTop: Spacing.sm },

  durRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  durChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Palette.grey100, borderWidth: 1, borderColor: Palette.grey300 },
  durChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  durText: { fontSize: 14, color: Palette.grey700, fontWeight: '600' },
  durTextActive: { color: '#fff' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeSlot: { width: '30%', paddingVertical: 11, borderRadius: Radius.md, backgroundColor: Palette.grey50, borderWidth: 1, borderColor: Palette.grey300, alignItems: 'center' },
  timeSlotSelected: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  timeSlotUnavail: { backgroundColor: Palette.grey100, borderColor: Palette.grey200 },
  timeText: { fontSize: 13, color: Palette.grey800, fontWeight: '500' },
  timeTextSelected: { color: '#fff', fontWeight: '700' },
  timeTextUnavail: { color: Palette.grey400 },
  unavailDot: { fontSize: 9, color: Palette.danger, marginTop: 2 },

  summaryBox: { marginTop: Spacing.lg, backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: Palette.grey600 },
  summaryValue: { fontSize: 13, color: Palette.grey900 },

  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200 },
  continueBtn: { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Palette.grey300 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
