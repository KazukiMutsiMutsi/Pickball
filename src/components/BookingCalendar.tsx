import { Palette, Spacing } from '@/constants/theme';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBookingsForSlot } from '../booking/bookingStore';

// Courts to show
const COURTS = [
  { id: '1', name: 'Court 1', price: 20 },
  { id: '2', name: 'Court 2', price: 20 },
  { id: '3', name: 'Court 3', price: 25 },
];

// Hours 6 AM – 11 PM
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

function to12h(h: number) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${period}`;
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildWeekDays(): { label: string; iso: string }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      iso: toDateStr(d),
    };
  });
}

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isHourBooked(courtId: string, date: string, hour: number): boolean {
  const bookings = getBookingsForSlot(courtId, date);
  const slotStart = hour * 60;
  const slotEnd = slotStart + 60;
  return bookings.some(
    (b) => slotStart < toMins(b.endTime) && slotEnd > toMins(b.startTime),
  );
}

export function BookingCalendar() {
  const days = buildWeekDays();
  const [selectedDay, setSelectedDay] = useState(days[0].iso);

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelectorContent}
        style={styles.daySelector}
      >
        {days.map((d) => (
          <TouchableOpacity
            key={d.iso}
            style={[styles.dayChip, selectedDay === d.iso && styles.dayChipActive]}
            onPress={() => setSelectedDay(d.iso)}
            accessibilityRole="button"
            accessibilityLabel={d.label}
            accessibilityState={{ selected: selectedDay === d.iso }}
          >
            <Text style={[styles.dayChipText, selectedDay === d.iso && styles.dayChipTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.timeCell} />
            {COURTS.map((c) => (
              <View key={c.id} style={styles.courtHeader}>
                <Text style={styles.courtHeaderText}>{c.name}</Text>
                <Text style={styles.courtHeaderPrice}>₱{c.price}/hr</Text>
              </View>
            ))}
          </View>

          {/* Hour rows */}
          {HOURS.map((h) => (
            <View key={h} style={styles.row}>
              <View style={styles.timeCell}>
                <Text style={styles.timeText}>{to12h(h)}</Text>
              </View>
              {COURTS.map((c) => {
                const booked = isHourBooked(c.id, selectedDay, h);
                return (
                  <View
                    key={c.id}
                    style={[styles.slotCell, booked ? styles.slotBooked : styles.slotFree]}
                  >
                    <Text style={[styles.slotText, booked ? styles.slotTextBooked : styles.slotTextFree]}>
                      {booked ? 'Booked' : 'Free'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E8F5E9' }]} />
          <Text style={styles.legendText}>Free</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFEBEE' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>
    </View>
  );
}

const CELL_WIDTH = 88;
const TIME_WIDTH = 70;
const ROW_HEIGHT = 44;

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.md },
  daySelector: { marginBottom: Spacing.sm },
  daySelectorContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  dayChipActive: { backgroundColor: Palette.primary },
  dayChipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },

  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  timeCell: { width: TIME_WIDTH, justifyContent: 'center', paddingLeft: Spacing.md },
  timeText: { fontSize: 11, color: '#64748B' },
  courtHeader: { width: CELL_WIDTH, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  courtHeaderText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  courtHeaderPrice: { fontSize: 10, color: '#64748B', marginTop: 2 },

  row: { flexDirection: 'row', height: ROW_HEIGHT, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  slotCell: { width: CELL_WIDTH, height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  slotFree: { backgroundColor: '#E8F5E9' },
  slotBooked: { backgroundColor: '#FFEBEE' },
  slotText: { fontSize: 11, fontWeight: '600' },
  slotTextFree: { color: '#43A047' },
  slotTextBooked: { color: '#EF5350' },

  legend: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: '#64748B' },
});
