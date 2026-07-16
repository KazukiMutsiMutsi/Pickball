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

// ─── Data ─────────────────────────────────────────────────────────────────────
const COURTS = [
  { id: '1', label: 'CRT1', pricePerHour: 500 },
  { id: '2', label: 'CRT2', pricePerHour: 500 },
  { id: '3', label: 'CRT3', pricePerHour: 500 },
];

const HOURS = [
  { label: '6AM–7AM',   icon: '🌅', key: '06' },
  { label: '7AM–8AM',   icon: '🌅', key: '07' },
  { label: '8AM–9AM',   icon: '🌅', key: '08' },
  { label: '9AM–10AM',  icon: '☀️', key: '09' },
  { label: '10AM–11AM', icon: '☀️', key: '10' },
  { label: '11AM–12PM', icon: '☀️', key: '11' },
  { label: '12PM–1PM',  icon: '☀️', key: '12' },
  { label: '1PM–2PM',   icon: '☀️', key: '13' },
  { label: '2PM–3PM',   icon: '☀️', key: '14' },
  { label: '3PM–4PM',   icon: '☀️', key: '15' },
  { label: '4PM–5PM',   icon: '☀️', key: '16' },
  { label: '5PM–6PM',   icon: '☀️', key: '17' },
  { label: '6PM–7PM',   icon: '🌙', key: '18' },
  { label: '7PM–8PM',   icon: '🌙', key: '19' },
  { label: '8PM–9PM',   icon: '🌙', key: '20' },
  { label: '9PM–10PM',  icon: '🌙', key: '21' },
  { label: '10PM–11PM', icon: '🌙', key: '22' },
  { label: '11PM–12AM', icon: '🌙', key: '23' },
  { label: '12AM–1AM',  icon: '🌙', key: '00' },
];

// courtId → dayKey → booked hour keys
const MOCK_BOOKED: Record<string, Record<string, string[]>> = {
  '1': { '0': ['09','10'],              '1': ['07','14'],             '2': ['18','19'] },
  '2': { '0': ['07','13','14','15'],    '1': ['09','10','11'],        '2': ['08'] },
  '3': { '0': ['18','19','20'],         '1': ['10'],                  '2': ['13','14'] },
};

type SlotStatus = 'open' | 'booked' | 'past' | 'start' | 'end' | 'range';

function buildDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key:     i.toString(),
      short:   d.toLocaleDateString('en-US', { weekday: 'short' }),
      num:     d.getDate(),
      fullLabel: i === 0
        ? `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      isToday: i === 0,
    };
  });
}
const CAL_DAYS = buildDays();

function getSlotStatus(
  courtId: string,
  dayKey: string,
  hourKey: string,
  nowHour: number,
  startSel: { courtId: string; hourKey: string } | null,
  endSel:   { courtId: string; hourKey: string } | null,
): SlotStatus {
  const booked = MOCK_BOOKED[courtId]?.[dayKey] ?? [];
  if (booked.includes(hourKey)) return 'booked';
  if (dayKey === '0' && parseInt(hourKey, 10) <= nowHour) return 'past';

  const hNum = parseInt(hourKey, 10);

  if (startSel?.courtId === courtId && startSel.hourKey === hourKey) return 'start';
  if (endSel?.courtId   === courtId && endSel.hourKey   === hourKey) return 'end';

  // highlight range between start and end (same court)
  if (
    startSel?.courtId === courtId &&
    endSel?.courtId   === courtId
  ) {
    const sNum = parseInt(startSel.hourKey, 10);
    const eNum = parseInt(endSel.hourKey, 10);
    if (hNum > sNum && hNum < eNum) return 'range';
  }

  return 'open';
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BookingCalendar() {
  const router = useRouter();
  const [selDay, setSelDay] = useState('0');

  // start/end selection — each holds { courtId, hourKey }
  const [startSel, setStartSel] = useState<{ courtId: string; hourKey: string } | null>(null);
  const [endSel,   setEndSel]   = useState<{ courtId: string; hourKey: string } | null>(null);

  const nowHour   = new Date().getHours();
  const selDayObj = CAL_DAYS.find(d => d.key === selDay)!;

  const resetSelection = () => { setStartSel(null); setEndSel(null); };

  const handleCellTap = (courtId: string, hourKey: string) => {
    const hNum = parseInt(hourKey, 10);

    // If no start yet → set as start
    if (!startSel) {
      setStartSel({ courtId, hourKey });
      setEndSel(null);
      return;
    }

    // Tapping same cell as start → deselect
    if (startSel.courtId === courtId && startSel.hourKey === hourKey) {
      resetSelection();
      return;
    }

    // Different court → start fresh on that court
    if (startSel.courtId !== courtId) {
      setStartSel({ courtId, hourKey });
      setEndSel(null);
      return;
    }

    const startNum = parseInt(startSel.hourKey, 10);

    // Must be after start
    if (hNum > startNum) {
      setEndSel({ courtId, hourKey });
    } else {
      // Tapped before or equal to start → make this the new start
      setStartSel({ courtId, hourKey });
      setEndSel(null);
    }
  };

  // Derived values for the book button
  const bookingSummary = (() => {
    if (!startSel) return null;
    const court    = COURTS.find(c => c.id === startSel.courtId)!;
    const startHour = parseInt(startSel.hourKey, 10);
    // If end is selected use it, otherwise 1-hr slot (start+1)
    const endHour   = endSel ? parseInt(endSel.hourKey, 10) : startHour + 1;
    const duration  = endHour - startHour; // hours
    const startTime = `${String(startHour).padStart(2, '0')}:00`;
    const endTime   = `${String(endHour === 24 ? 0 : endHour).padStart(2, '0')}:00`;
    const startLabel = HOURS.find(h => h.key === startSel.hourKey)?.label ?? startSel.hourKey;
    const endLabel   = endSel
      ? (HOURS.find(h => h.key === endSel.hourKey)?.label ?? endSel.hourKey)
      : null;
    const dateISO = (() => {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(selDay, 10));
      return d.toISOString().slice(0, 10);
    })();
    return { court, startTime, endTime, duration, startLabel, endLabel, dateISO };
  })();

  const cellBg = (status: SlotStatus) => {
    switch (status) {
      case 'open':  return '#fff';
      case 'booked':return '#fff';
      case 'past':  return '#F8FAFC';
      case 'start': return Palette.primary;
      case 'end':   return '#0D6EAB';
      case 'range': return Palette.primaryLight;
    }
  };

  const cellBorder = (status: SlotStatus) => {
    switch (status) {
      case 'open':  return '#E2E8F0';
      case 'booked':return '#E2E8F0';
      case 'past':  return '#F1F5F9';
      case 'start': return Palette.primary;
      case 'end':   return '#0D6EAB';
      case 'range': return Palette.primary;
    }
  };

  const cellTextColor = (status: SlotStatus) => {
    switch (status) {
      case 'open':  return Palette.success;
      case 'booked':return Palette.grey600;
      case 'past':  return Palette.grey400;
      case 'start': return '#fff';
      case 'end':   return '#fff';
      case 'range': return Palette.primary;
    }
  };

  const cellLabel = (status: SlotStatus, courtId: string) => {
    switch (status) {
      case 'open':  return 'Open';
      case 'booked':return 'Booked';
      case 'past':  return 'Past';
      case 'start':
        // If no end is picked yet for this court, show Start–End (1 hr)
        return (endSel?.courtId === courtId) ? 'Start' : 'Start–End';
      case 'end':   return 'End';
      case 'range': return '✓';
    }
  };

  return (
    <View style={s.wrap}>

      {/* ── Header ── */}
      <View style={s.cardHead}>
        <View>
          <Text style={s.cardTitle}>Book a Slot</Text>
          <Text style={s.cardSub}>Choose date and time</Text>
        </View>
        <View style={s.livePill}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>Live</Text>
        </View>
      </View>

      {/* ── Date strip ── */}
      <Text style={s.sectionLabel}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.strip}>
        {CAL_DAYS.map(d => (
          <TouchableOpacity
            key={d.key}
            style={[s.dayChip, selDay === d.key && s.dayChipActive]}
            onPress={() => { setSelDay(d.key); resetSelection(); }}
            accessibilityRole="button"
            accessibilityLabel={d.fullLabel}
          >
            <Text style={[s.dayShort, selDay === d.key && s.activeText]}>{d.short}</Text>
            <Text style={[s.dayNum,   selDay === d.key && s.activeText]}>{d.num}</Text>
            {d.isToday && <View style={s.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected date label */}
      <View style={s.selectedDateRow}>
        <Text style={s.selectedDateIcon}>📅</Text>
        <Text style={s.selectedDateText}>{selDayObj.fullLabel}</Text>
      </View>

      {/* ── Legend ── */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: Palette.success, backgroundColor: '#fff' }]} />
          <Text style={s.legendText}>Open</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: Palette.primary, backgroundColor: Palette.primary }]} />
          <Text style={s.legendText}>Start</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: '#0D6EAB', backgroundColor: '#0D6EAB' }]} />
          <Text style={s.legendText}>End</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: Palette.primary, backgroundColor: Palette.primaryLight }]} />
          <Text style={s.legendText}>Range</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: '#E2E8F0', backgroundColor: '#fff' }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.grey400 }} />
          </View>
          <Text style={s.legendText}>Booked</Text>
        </View>
      </View>

      {/* ── Sports tag ── */}
      <View style={s.sportRow}>
        <Text style={s.sportLabel}>Sport:</Text>
        <View style={s.sportChip}>
          <Text style={{ fontSize: 14 }}>🏓</Text>
          <Text style={s.sportChipText}>Pickleball</Text>
        </View>
      </View>

      {/* ── Advanced Booking ── */}
      <TouchableOpacity
        style={s.advanceBtn}
        onPress={() =>
          router.push({
            pathname: '/booking/advance',
            params: { courtId: '1', courtName: 'Pickleball Court', price: '500' },
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Advanced booking — pick any date"
      >
        <Text style={s.advanceBtnIcon}>🗓️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.advanceBtnText}>Advanced Booking</Text>
          <Text style={s.advanceBtnSub}>Pick a date up to 30 days ahead</Text>
        </View>
        <Text style={s.advanceBtnArrow}>›</Text>
      </TouchableOpacity>

      {/* ── Grid table ── */}
      <View style={s.tableWrap}>
        {/* Table header */}
        <View style={s.tableHeader}>
          <View style={s.timeCol}>
            <Text style={s.headerText}>Times</Text>
          </View>
          {COURTS.map(c => (
            <View key={c.id} style={s.courtCol}>
              <Text style={s.headerText}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Table rows */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={s.tableScroll}
          nestedScrollEnabled
        >
          {HOURS.map((hour, rowIdx) => (
            <View
              key={hour.key}
              style={[s.tableRow, rowIdx % 2 === 0 && s.tableRowAlt]}
            >
              {/* Time cell */}
              <View style={s.timeCol}>
                <Text style={s.timeIcon}>{hour.icon}</Text>
                <Text style={s.timeText}>{hour.label}</Text>
              </View>

              {/* Court cells */}
              {COURTS.map(court => {
                const status = getSlotStatus(court.id, selDay, hour.key, nowHour, startSel, endSel);
                const isOpen = status === 'open';
                return (
                  <View key={court.id} style={s.courtCol}>
                    <TouchableOpacity
                      style={[
                        s.cell,
                        { backgroundColor: cellBg(status), borderColor: cellBorder(status) },
                        (status === 'start' || status === 'end') && s.cellSelected,
                      ]}
                      onPress={() => (isOpen || status === 'start' || status === 'end' || status === 'range') && handleCellTap(court.id, hour.key)}
                      disabled={status === 'booked' || status === 'past'}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${court.label} ${hour.label} ${cellLabel(status, court.id)}`}
                    >
                      <Text style={[s.cellText, { color: cellTextColor(status) }]}>
                        {cellLabel(status, court.id)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Book button ── */}
      {bookingSummary && (() => {
        const { court, startTime, endTime, duration, startLabel, endLabel, dateISO } = bookingSummary;
        const slotDisplay = endLabel
          ? `${startLabel} → ${endLabel}`
          : `${startLabel} (1 hr)`;
        return (
          <TouchableOpacity
            style={s.bookBtn}
            onPress={() =>
              router.push({
                pathname: '/booking/players',
                params: {
                  courtId:   court.id,
                  courtName: `${court.label} – Pickleball Court`,
                  price:     String(court.pricePerHour),
                  date:      dateISO,
                  startTime,
                  endTime,
                  duration:  String(duration),
                  total:     String(court.pricePerHour * duration),
                },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Book ${court.label} ${slotDisplay}`}
          >
            <Text style={s.bookBtnIcon}>📅</Text>
            <Text style={s.bookBtnText}>
              Book {court.label}  ·  {slotDisplay}  ·  {selDayObj.fullLabel}
            </Text>
          </TouchableOpacity>
        );
      })()}


    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W   = Math.min(W, 480) - Spacing.md * 2;
const TIME_W   = 88;
const COURT_W  = (CARD_W - TIME_W - Spacing.md * 2 - 2) / 3; // 3 equal court columns

const s = StyleSheet.create({
  wrap:             { marginHorizontal: Spacing.md, backgroundColor: '#fff', borderRadius: 20, padding: Spacing.md, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, maxWidth: 480, alignSelf: 'center', width: '100%' },

  // Card header
  cardHead:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle:        { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  cardSub:          { fontSize: 12, color: '#64748B', marginTop: 2 },
  livePill:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, gap: 4 },
  liveDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText:         { fontSize: 11, color: '#EF4444', fontWeight: '700' },

  // Section label
  sectionLabel:     { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: Spacing.sm },

  // Date strip
  strip:            { gap: Spacing.sm, paddingBottom: 4 },
  dayChip:          { alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, minWidth: 48, borderWidth: 1.5, borderColor: '#E2E8F0', position: 'relative' },
  dayChipActive:    { backgroundColor: Palette.primary, borderColor: Palette.primary },
  dayShort:         { fontSize: 10, color: '#64748B', fontWeight: '600' },
  dayNum:           { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  activeText:       { color: '#fff' },
  todayDot:         { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444' },

  // Selected date
  selectedDateRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  selectedDateIcon: { fontSize: 14 },
  selectedDateText: { fontSize: 13, fontWeight: '700', color: Palette.primary },

  // Legend
  legend:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.sm },
  legendItem:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch:     { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  legendText:       { fontSize: 11, color: '#64748B' },

  // Sport
  sportRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sportLabel:       { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  sportChip:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Palette.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, borderWidth: 1.5, borderColor: Palette.primary },
  sportChipText:    { fontSize: 13, fontWeight: '700', color: Palette.primary },

  // Table
  tableWrap:        { borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', marginBottom: Spacing.md },
  tableHeader:      { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0' },
  tableRow:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableRowAlt:      { backgroundColor: '#FAFAFA' },
  tableScroll:      { maxHeight: 420 },

  timeCol:          { width: TIME_W, paddingVertical: 10, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
  courtCol:         { width: COURT_W, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },

  headerText:       { fontSize: 12, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  timeIcon:         { fontSize: 12 },
  timeText:         { fontSize: 11, fontWeight: '600', color: '#64748B', flexShrink: 1 },

  // Slot cell
  cell:             { width: '100%', paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cellSelected:     { borderWidth: 2 },
  cellText:         { fontSize: 11, fontWeight: '700' },

  // Book button
  bookBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 14, height: 54, marginBottom: Spacing.sm, gap: 8, paddingHorizontal: Spacing.md },
  bookBtnIcon:      { fontSize: 16 },
  bookBtnText:      { color: '#fff', fontSize: 13, fontWeight: '800', flexShrink: 1 },

  // Advanced booking
  advanceBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, borderRadius: 12, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1.5, borderColor: Palette.primary },
  advanceBtnIcon:   { fontSize: 22 },
  advanceBtnText:   { fontSize: 14, fontWeight: '700', color: Palette.primary },
  advanceBtnSub:    { fontSize: 11, color: '#64748B', marginTop: 2 },
  advanceBtnArrow:  { fontSize: 22, color: Palette.primary },
});
