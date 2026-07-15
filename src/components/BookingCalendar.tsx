import { Palette, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: W } = Dimensions.get('window');

const CAL_COURTS = [
  { id: '1', name: 'Court 1', pricePerHour: 20 },
  { id: '2', name: 'Court 2', pricePerHour: 15 },
  { id: '3', name: 'Court 3', pricePerHour: 18 },
];

const HOURS = [
  '6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM',
];

const MOCK_BOOKED: Record<string, Record<string, string[]>> = {
  '1': { '0': ['9:00 AM','10:00 AM'],              '1': ['7:00 AM','2:00 PM'],             '2': ['6:00 PM','7:00 PM'] },
  '2': { '0': ['7:00 AM','3:00 PM'],               '1': ['9:00 AM','10:00 AM','11:00 AM'], '2': ['8:00 AM'] },
  '3': { '0': ['6:00 PM','7:00 PM','8:00 PM'],     '1': ['10:00 AM'],                      '2': ['1:00 PM','2:00 PM'] },
};

function buildDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key:     i.toString(),
      short:   d.toLocaleDateString('en-US', { weekday: 'short' }),
      num:     d.getDate(),
      label:   i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
               : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: i === 0,
    };
  });
}
const CAL_DAYS = buildDays();

function buildSlots(courtId: string, dayKey: string) {
  const booked  = MOCK_BOOKED[courtId]?.[dayKey] ?? [];
  const pastIdx = dayKey === '0' ? Math.max(0, new Date().getHours() - 6) : -1;
  return HOURS.map((time, idx) => ({
    time,
    status: (dayKey === '0' && idx <= pastIdx) ? 'past'
          : booked.includes(time)              ? 'booked'
          : 'available',
  }));
}

const CONTAINER_W = Math.min(W, 480) - Spacing.md * 2; // capped at 480 (card inner width)
const SLOT_W = (CONTAINER_W - Spacing.sm * 2) / 3;

export function BookingCalendar() {
  const router = useRouter();
  const [selDay,   setSelDay]   = useState('0');
  const [selCourt, setSelCourt] = useState('1');
  const [selSlot,  setSelSlot]  = useState<string | null>(null);

  const court   = CAL_COURTS.find((c) => c.id === selCourt) ?? CAL_COURTS[0];
  const dayLbl  = CAL_DAYS.find((d) => d.key === selDay)?.label ?? '';
  const slots   = buildSlots(selCourt, selDay);
  const freeCount = slots.filter((s) => s.status === 'available').length;
  const bookedCount = slots.filter((s) => s.status === 'booked').length;

  return (
    <View style={cal.wrap}>

      <View style={cal.cardHead}>
        <View>
          <Text style={cal.cardTitle}>Book a Slot</Text>
          <Text style={cal.cardSub}>Choose date, court and time</Text>
        </View>
        <View style={cal.livePill}>
          <View style={cal.liveDot} />
          <Text style={cal.liveText}>Live</Text>
        </View>
      </View>

      <Text style={cal.label}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cal.strip}>
        {CAL_DAYS.map((d) => (
          <TouchableOpacity
            key={d.key}
            style={[cal.dayChip, selDay === d.key && cal.dayChipActive]}
            onPress={() => { setSelDay(d.key); setSelSlot(null); }}
            accessibilityRole="button"
            accessibilityLabel={d.label}
          >
            <Text style={[cal.dayShort, selDay === d.key && cal.activeText]}>{d.short}</Text>
            <Text style={[cal.dayNum,   selDay === d.key && cal.activeText]}>{d.num}</Text>
            {d.isToday && <View style={cal.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={cal.label}>Court</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cal.strip}>
        {CAL_COURTS.map((c) => {
          const free = buildSlots(c.id, selDay).filter((s) => s.status === 'available').length;
          const active = selCourt === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[cal.courtChip, active && cal.courtChipActive]}
              onPress={() => { setSelCourt(c.id); setSelSlot(null); }}
              accessibilityRole="button"
              accessibilityLabel={c.name}
            >
              <Text style={[cal.courtName, active && { color: Palette.primary }]} numberOfLines={1}>{c.name}</Text>
              <Text style={free === 0 ? cal.courtFull : cal.courtFree}>
                {free > 0 ? `${free} free` : 'Full'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={cal.statsRow}>
        <View style={[cal.pill, { backgroundColor: '#E8F8EF' }]}>
          <Text style={[cal.pillText, { color: Palette.success }]}>✓ {freeCount} available</Text>
        </View>
        <View style={[cal.pill, { backgroundColor: '#FDECEA' }]}>
          <Text style={[cal.pillText, { color: Palette.danger }]}>✗ {bookedCount} booked</Text>
        </View>
        <View style={[cal.pill, { backgroundColor: Palette.primaryLight }]}>
          <Text style={[cal.pillText, { color: Palette.primary }]}>₱{court.pricePerHour}/hr</Text>
        </View>
      </View>

      <View style={cal.legend}>
        {[
          { bg: '#E8F8EF',        text: 'Available', tc: Palette.success  },
          { bg: '#FDECEA',        text: 'Booked',    tc: Palette.danger   },
          { bg: Palette.primary,  text: 'Selected',  tc: '#fff'           },
          { bg: Palette.grey200,  text: 'Past',      tc: Palette.grey500  },
        ].map((l) => (
          <View key={l.text} style={cal.legendItem}>
            <View style={[cal.legendDot, { backgroundColor: l.bg }]} />
            <Text style={cal.legendText}>{l.text}</Text>
          </View>
        ))}
      </View>

      <Text style={cal.label}>Time Slot</Text>
      <View style={cal.grid}>
        {slots.map(({ time, status }) => {
          const isSel  = selSlot === time;
          const bg     = status === 'past'    ? Palette.grey100
                       : status === 'booked'  ? '#FDECEA'
                       : isSel               ? Palette.primary : '#E8F8EF';
          const tc     = status === 'past'    ? Palette.grey400
                       : status === 'booked'  ? Palette.danger
                       : isSel               ? '#fff' : Palette.success;
          const lbl    = status === 'past'    ? 'Past'
                       : status === 'booked'  ? 'Booked'
                       : isSel               ? '✓ Selected' : 'Free';
          return (
            <TouchableOpacity
              key={time}
              disabled={status !== 'available'}
              onPress={() => setSelSlot(isSel ? null : time)}
              style={[cal.slot, { backgroundColor: bg }, isSel && cal.slotSelected]}
              accessibilityRole="button"
              accessibilityLabel={`${time} ${lbl}`}
              accessibilityState={{ disabled: status !== 'available', selected: isSel }}
            >
              <Text style={[cal.slotTime, { color: status === 'past' ? Palette.grey400 : Palette.grey800 }]}>{time}</Text>
              <Text style={[cal.slotLbl, { color: tc }]}>{lbl}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selSlot && (
        <TouchableOpacity
          style={cal.bookBtn}
          onPress={() => router.push({ pathname: '/booking/time', params: { courtId: court.id, courtName: court.name, price: court.pricePerHour, date: new Date().toISOString().slice(0, 10) } })}
          accessibilityRole="button"
          accessibilityLabel={`Book ${court.name} at ${selSlot} on ${dayLbl}`}
        >
          <Text style={cal.bookBtnText}>📅  Book {court.name}  ·  {selSlot}  ·  {dayLbl}</Text>
        </TouchableOpacity>
      )}

      {/* Advanced Booking button */}
      <TouchableOpacity
        style={cal.advanceBtn}
        onPress={() => router.push({ pathname: '/booking/advance', params: { courtId: court.id, courtName: court.name, price: String(court.pricePerHour) } })}
        accessibilityRole="button"
        accessibilityLabel="Advanced booking — pick any date"
      >
        <Text style={cal.advanceBtnIcon}>🗓️</Text>
        <View style={{ flex: 1 }}>
          <Text style={cal.advanceBtnText}>Advanced Booking</Text>
          <Text style={cal.advanceBtnSub}>Pick a date up to 30 days ahead</Text>
        </View>
        <Text style={cal.advanceBtnArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap:          { marginHorizontal: Spacing.md, backgroundColor: '#fff', borderRadius: 20, padding: Spacing.md, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, maxWidth: 480, alignSelf: 'center', width: '100%' },
  cardHead:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTitle:     { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  cardSub:       { fontSize: 12, color: '#64748B', marginTop: 2 },
  livePill:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, gap: 4 },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText:      { fontSize: 11, color: '#EF4444', fontWeight: '700' },
  label:         { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  strip:         { gap: Spacing.sm, paddingBottom: 4 },
  dayChip:       { alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, minWidth: 48, borderWidth: 1.5, borderColor: '#E2E8F0', position: 'relative' },
  dayChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  dayShort:      { fontSize: 10, color: '#64748B', fontWeight: '600' },
  dayNum:        { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  activeText:    { color: '#fff' },
  todayDot:      { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444' },
  courtChip:     { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, minWidth: 110, borderWidth: 1.5, borderColor: '#E2E8F0' },
  courtChipActive:{ borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  courtName:     { fontSize: 11, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  courtFree:     { fontSize: 10, fontWeight: '600', color: '#10B981' },
  courtFull:     { fontSize: 10, fontWeight: '600', color: '#EF4444' },
  statsRow:      { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  pill:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  pillText:      { fontSize: 11, fontWeight: '700' },
  legend:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:     { width: 10, height: 10, borderRadius: 3 },
  legendText:    { fontSize: 10, color: '#64748B' },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 4 },
  slot:          { width: SLOT_W, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  slotSelected:  { borderColor: Palette.primary },
  slotTime:      { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  slotLbl:       { fontSize: 10, fontWeight: '700' },
  bookBtn:       { marginTop: Spacing.md, backgroundColor: Palette.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  bookBtnText:   { color: '#fff', fontSize: 13, fontWeight: '800' },
  advanceBtn:    { marginTop: Spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, borderRadius: 12, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1.5, borderColor: Palette.primary },
  advanceBtnIcon:{ fontSize: 22 },
  advanceBtnText:{ fontSize: 14, fontWeight: '700', color: Palette.primary },
  advanceBtnSub: { fontSize: 11, color: Palette.grey600, marginTop: 2 },
  advanceBtnArrow:{ fontSize: 22, color: Palette.primary },
});
