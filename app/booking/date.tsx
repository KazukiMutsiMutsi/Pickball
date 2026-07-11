import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function SelectDateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId: string; courtName: string; price: string }>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Max advance booking: 30 days from today
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  // Only allow going back to current month
  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();
  // Only allow going forward while max date is in a later month
  const canGoNext = new Date(viewYear, viewMonth + 1, 1) <= maxDate;

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toISO = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < today || d > maxDate;
  };

  const formatSelected = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleContinue = () => {
    if (!selectedDate) return;
    router.push({
      pathname: '/booking/time',
      params: { ...params, date: selectedDate },
    });
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Date</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {['Date', 'Time', 'Summary', 'Payment'].map((step, i) => (
          <React.Fragment key={step}>
            <View style={[styles.progressDot, i === 0 && styles.progressDotActive]} />
            {i < 3 && <View style={[styles.progressLine, i === 0 && styles.progressLineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {['Date', 'Time', 'Summary', 'Payment'].map((step, i) => (
          <Text key={step} style={[styles.progressLabel, i === 0 && styles.progressLabelActive]}>
            {step}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.courtName}>{params.courtName}</Text>
        <Text style={styles.advanceNote}>📅 You can book up to <Text style={styles.advanceBold}>30 days</Text> in advance</Text>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]} disabled={!canGoPrev} accessibilityLabel="Previous month">
            <Text style={[styles.navIcon, !canGoPrev && styles.navIconDisabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]} disabled={!canGoNext} accessibilityLabel="Next month">
            <Text style={[styles.navIcon, !canGoNext && styles.navIconDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day-of-week labels */}
        <View style={styles.weekRow}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.weekLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;
            const iso = toISO(day);
            const disabled = isDisabled(day);
            const selected = selectedDate === iso;
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.dayCell, selected && styles.dayCellSelected, disabled && styles.dayCellPast]}
                onPress={() => !disabled && setSelectedDate(iso)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${MONTHS[viewMonth]} ${day}`}
              >
                <Text style={[styles.dayText, selected && styles.dayTextSelected, disabled && styles.dayTextPast]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDate && (
          <View style={styles.selectedWrap}>
            <Text style={styles.selectedLabel}>Selected</Text>
            <Text style={styles.selectedValue}>{formatSelected(selectedDate)}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedDate && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedDate}
          accessibilityRole="button"
          accessibilityLabel="Continue to select time"
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey200,
  },
  backBtn: { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.grey300 },
  progressDotActive: { backgroundColor: Palette.primary },
  progressLine: { flex: 1, height: 2, backgroundColor: Palette.grey300 },
  progressLineActive: { backgroundColor: Palette.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  progressLabel: { fontSize: 11, color: Palette.grey500, flex: 1, textAlign: 'center' },
  progressLabelActive: { color: Palette.primary, fontWeight: '700' },

  body: { padding: Spacing.md },
  courtName: { fontSize: 16, fontWeight: '700', color: Palette.grey900, marginBottom: Spacing.sm },
  advanceNote: { fontSize: 12, color: Palette.grey600, marginBottom: Spacing.md, backgroundColor: Palette.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm },
  advanceBold: { fontWeight: '700', color: Palette.primary },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  navBtn: { padding: Spacing.sm },
  navBtnDisabled: { opacity: 0.3 },
  navIcon: { fontSize: 28, color: Palette.primary },
  navIconDisabled: { color: Palette.grey400 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: Palette.grey900 },

  weekRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Palette.grey500 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCellSelected: { backgroundColor: Palette.primary, borderRadius: Radius.full },
  dayCellPast: { opacity: 0.3 },
  dayText: { fontSize: 15, color: Palette.grey900 },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextPast: { color: Palette.grey400 },

  selectedWrap: {
    marginTop: Spacing.lg,
    backgroundColor: Palette.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  selectedLabel: { fontSize: 12, color: Palette.primary, fontWeight: '600' },
  selectedValue: { fontSize: 15, color: Palette.grey900, fontWeight: '700', marginTop: 2 },

  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200 },
  continueBtn: { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Palette.grey300 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
