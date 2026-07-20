import { Palette, Spacing } from '@/constants/theme';
import {
  createPendingHold,
  getBookingsForSlot,
  getPendingHoldsForSlot,
  getSessionHoldId,
  hourKeysInRange,
  purgeExpiredHolds,
} from '@/src/booking/bookingStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
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
  { label: '6AM–7AM',   key: '06' },
  { label: '7AM–8AM',   key: '07' },
  { label: '8AM–9AM',   key: '08' },
  { label: '9AM–10AM',  key: '09' },
  { label: '10AM–11AM', key: '10' },
  { label: '11AM–12PM', key: '11' },
  { label: '12PM–1PM',  key: '12' },
  { label: '1PM–2PM',   key: '13' },
  { label: '2PM–3PM',   key: '14' },
  { label: '3PM–4PM',   key: '15' },
  { label: '4PM–5PM',   key: '16' },
  { label: '5PM–6PM',   key: '17' },
  { label: '6PM–7PM',   key: '18' },
  { label: '7PM–8PM',   key: '19' },
  { label: '8PM–9PM',   key: '20' },
  { label: '9PM–10PM',  key: '21' },
  { label: '10PM–11PM', key: '22' },
  { label: '11PM–12AM', key: '23' },
  { label: '12AM–1AM',  key: '00' },
];

type SlotStatus = 'open' | 'booked' | 'pending' | 'past' | 'start' | 'end' | 'range';

function toLocalISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
      dateISO: toLocalISO(d),
    };
  });
}
const CAL_DAYS = buildDays();

function normHour(h: number) {
  return h === 0 ? 24 : h;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BookingCalendar() {
  const router = useRouter();
  const [selDay, setSelDay] = useState('0');
  const [tick, setTick] = useState(0);

  const [startSel, setStartSel] = useState<{ courtId: string; hourKey: string } | null>(null);
  const [endSel,   setEndSel]   = useState<{ courtId: string; hourKey: string } | null>(null);

  const nowHour   = new Date().getHours();
  const selDayObj = CAL_DAYS.find(d => d.key === selDay)!;

  useFocusEffect(
    useCallback(() => {
      // Coming back from Players/Payment → refresh so Pending/Booked show
      purgeExpiredHolds();
      setStartSel(null);
      setEndSel(null);
      setTick(t => t + 1);
    }, []),
  );

  // Real booked + pending hour keys from the store (per court, selected date)
  const { bookedMap, pendingMap } = useMemo(() => {
    const booked:  Record<string, Set<string>> = {};
    const pending: Record<string, Set<string>> = {};
    for (const court of COURTS) {
      const bSet = new Set<string>();
      const pSet = new Set<string>();
      for (const b of getBookingsForSlot(court.id, selDayObj.dateISO)) {
        hourKeysInRange(b.startTime, b.endTime).forEach(k => bSet.add(k));
      }
      for (const h of getPendingHoldsForSlot(court.id, selDayObj.dateISO)) {
        hourKeysInRange(h.startTime, h.endTime).forEach(k => pSet.add(k));
      }
      booked[court.id]  = bSet;
      pending[court.id] = pSet;
    }
    return { bookedMap: booked, pendingMap: pending };
  }, [selDayObj.dateISO, tick]);

  const getSlotStatus = (
    courtId: string,
    hourKey: string,
  ): SlotStatus => {
    // Confirmed bookings always win
    if (bookedMap[courtId]?.has(hourKey)) return 'booked';
    // Pending hold (soft lock) — show before local selection so Back reveals orange
    if (pendingMap[courtId]?.has(hourKey)) return 'pending';
    if (selDay === '0' && hourKey !== '00' && parseInt(hourKey, 10) <= nowHour) return 'past';

    if (startSel?.courtId === courtId && startSel.hourKey === hourKey) return 'start';
    if (endSel?.courtId   === courtId && endSel.hourKey   === hourKey) return 'end';

    if (startSel?.courtId === courtId && endSel?.courtId === courtId) {
      const hNum = normHour(parseInt(hourKey, 10));
      const sNum = normHour(parseInt(startSel.hourKey, 10));
      const eNum = normHour(parseInt(endSel.hourKey, 10));
      if (hNum > sNum && hNum < eNum) return 'range';
    }

    return 'open';
  };

  const resetSelection = () => { setStartSel(null); setEndSel(null); };

  const handleCellTap = (courtId: string, hourKey: string) => {
    const status = getSlotStatus(courtId, hourKey);
    if (status === 'booked' || status === 'pending' || status === 'past') return;

    const hNum = normHour(parseInt(hourKey, 10));

    if (!startSel) {
      setStartSel({ courtId, hourKey });
      setEndSel(null);
      return;
    }

    if (startSel.courtId === courtId && startSel.hourKey === hourKey) {
      resetSelection();
      return;
    }

    if (startSel.courtId !== courtId) {
      setStartSel({ courtId, hourKey });
      setEndSel(null);
      return;
    }

    const startNum = normHour(parseInt(startSel.hourKey, 10));

    if (hNum > startNum) {
      // Block if any hour in the range is booked/pending
      const blocked = HOURS.some(h => {
        const n = normHour(parseInt(h.key, 10));
        if (n < startNum || n >= hNum) return false;
        const st = (() => {
          if (bookedMap[courtId]?.has(h.key)) return 'booked';
          if (pendingMap[courtId]?.has(h.key)) return 'pending';
          return 'open';
        })();
        return st === 'booked' || st === 'pending';
      });
      if (blocked) {
        Alert.alert('Unavailable', 'That range includes a booked or pending slot.');
        return;
      }
      setEndSel({ courtId, hourKey });
    } else {
      setStartSel({ courtId, hourKey });
      setEndSel(null);
    }
  };

  const bookingSummary = (() => {
    if (!startSel) return null;
    const court     = COURTS.find(c => c.id === startSel.courtId)!;
    const startHour = parseInt(startSel.hourKey, 10);
    const endHourRaw = endSel ? parseInt(endSel.hourKey, 10) : startHour + 1;
    const endHour   = endSel && endHourRaw === 0 ? 24 : endHourRaw;
    const duration  = endHour - startHour;
    if (duration <= 0) return null;
    const startTime = `${String(startHour).padStart(2, '0')}:00`;
    const endTime   = `${String(endHour === 24 ? 0 : endHour).padStart(2, '0')}:00`;
    const startLabel = HOURS.find(h => h.key === startSel.hourKey)?.label ?? startSel.hourKey;
    const endLabel   = endSel
      ? (HOURS.find(h => h.key === endSel.hourKey)?.label ?? endSel.hourKey)
      : null;
    return { court, startTime, endTime, duration, startLabel, endLabel, dateISO: selDayObj.dateISO };
  })();

  const handleBook = () => {
    if (!bookingSummary) return;
    const { court, startTime, endTime, duration, dateISO } = bookingSummary;
    const hold = createPendingHold(
      court.id,
      dateISO,
      startTime,
      endTime,
      getSessionHoldId() ?? undefined,
    );
    if (!hold) {
      Alert.alert(
        'Slot unavailable',
        'This time is booked or pending. Please choose another slot.',
      );
      setTick(t => t + 1);
      resetSelection();
      return;
    }
    // Clear selection so when user presses Back, cell shows Pending (not Start)
    resetSelection();
    setTick(t => t + 1);
    const subtotal   = court.pricePerHour * duration;
    const serviceFee = subtotal * 0.05;
    const grandTotal = subtotal + serviceFee;
    router.push({
      pathname: '/booking/payment',
      params: {
        courtId:   court.id,
        courtName: `${court.label} – Pickleball Court`,
        price:     String(court.pricePerHour),
        date:      dateISO,
        startTime,
        endTime,
        duration:  String(duration),
        total:     String(subtotal),
        serviceFee: String(serviceFee),
        grandTotal: String(grandTotal),
        holdId:    hold.id,
      },
    });
  };

  const cellBg = (status: SlotStatus) => {
    switch (status) {
      case 'open':    return '#fff';
      case 'booked':  return '#FEF2F2';
      case 'pending': return '#FFF7ED';
      case 'past':    return '#F8FAFC';
      case 'start':   return Palette.primary;
      case 'end':     return '#0D6EAB';
      case 'range':   return Palette.primaryLight;
    }
  };

  const cellBorder = (status: SlotStatus) => {
    switch (status) {
      case 'open':    return '#E2E8F0';
      case 'booked':  return '#FCA5A5';
      case 'pending': return '#FDBA74';
      case 'past':    return '#F1F5F9';
      case 'start':   return Palette.primary;
      case 'end':     return '#0D6EAB';
      case 'range':   return Palette.primary;
    }
  };

  const cellTextColor = (status: SlotStatus) => {
    switch (status) {
      case 'open':    return Palette.success;
      case 'booked':  return '#DC2626';
      case 'pending': return '#EA580C';
      case 'past':    return Palette.grey400;
      case 'start':   return '#fff';
      case 'end':     return '#fff';
      case 'range':   return Palette.primary;
    }
  };

  const cellLabel = (status: SlotStatus, courtId: string) => {
    switch (status) {
      case 'open':    return 'Open';
      case 'booked':  return 'Booked';
      case 'pending': return 'Pending';
      case 'past':    return 'Past';
      case 'start':
        return (endSel?.courtId === courtId) ? 'Start' : 'Start–End';
      case 'end':     return 'End';
      case 'range':   return '✓';
    }
  };

  return (
    <View style={s.wrap}>

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

      <View style={s.selectedDateRow}>
        <Text style={s.selectedDateText}>{selDayObj.fullLabel}</Text>
      </View>

      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: Palette.success, backgroundColor: '#fff' }]} />
          <Text style={s.legendText}>Open</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' }]} />
          <Text style={s.legendText}>Pending</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]} />
          <Text style={s.legendText}>Booked</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { borderColor: Palette.primary, backgroundColor: Palette.primary }]} />
          <Text style={s.legendText}>Selected</Text>
        </View>
      </View>

      <View style={s.sportRow}>
        <Text style={s.sportLabel}>Sport</Text>
        <View style={s.sportChip}>
          <Text style={s.sportChipText}>Pickleball</Text>
        </View>
      </View>

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
        <View style={{ flex: 1 }}>
          <Text style={s.advanceBtnText}>Advanced Booking</Text>
          <Text style={s.advanceBtnSub}>Pick a date up to 30 days ahead</Text>
        </View>
        <Text style={s.advanceBtnArrow}>›</Text>
      </TouchableOpacity>

      <View style={s.tableWrap}>
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
              <View style={s.timeCol}>
                <Text style={s.timeText}>{hour.label}</Text>
              </View>

              {COURTS.map(court => {
                const status = getSlotStatus(court.id, hour.key);
                const canTap = status === 'open' || status === 'start' || status === 'end' || status === 'range';
                return (
                  <View key={court.id} style={s.courtCol}>
                    <TouchableOpacity
                      style={[
                        s.cell,
                        { backgroundColor: cellBg(status), borderColor: cellBorder(status) },
                        (status === 'start' || status === 'end') && s.cellSelected,
                      ]}
                      onPress={() => canTap && handleCellTap(court.id, hour.key)}
                      disabled={!canTap}
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

      {bookingSummary && (() => {
        const { court, startLabel, endLabel } = bookingSummary;
        const slotDisplay = endLabel
          ? `${startLabel} → ${endLabel}`
          : `${startLabel} (1 hr)`;
        return (
          <TouchableOpacity
            style={s.bookBtn}
            onPress={handleBook}
            accessibilityRole="button"
            accessibilityLabel={`Book ${court.label} ${slotDisplay}`}
          >
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
const COURT_W  = (CARD_W - TIME_W - Spacing.md * 2 - 2) / 3;

const s = StyleSheet.create({
  wrap:             { marginHorizontal: Spacing.md, backgroundColor: '#fff', borderRadius: 20, padding: Spacing.md, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, maxWidth: 480, alignSelf: 'center', width: '100%' },

  cardHead:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle:        { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  cardSub:          { fontSize: 12, color: '#64748B', marginTop: 2 },
  livePill:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, gap: 4 },
  liveDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText:         { fontSize: 11, color: '#EF4444', fontWeight: '700' },

  sectionLabel:     { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: Spacing.sm },
  strip:            { gap: Spacing.sm, paddingBottom: Spacing.sm },
  dayChip:          { width: 56, height: 68, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayChipActive:    { backgroundColor: Palette.primary, borderColor: Palette.primary },
  dayShort:         { fontSize: 11, fontWeight: '600', color: '#64748B' },
  dayNum:           { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  activeText:       { color: '#fff' },
  todayDot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: Palette.primary, marginTop: 2 },

  selectedDateRow: { marginBottom: Spacing.sm },
  selectedDateText:{ fontSize: 13, fontWeight: '700', color: '#0F172A' },

  legend:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.sm },
  legendItem:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch:     { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  legendText:       { fontSize: 11, color: '#64748B' },

  sportRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sportLabel:       { fontSize: 12, color: '#64748B', fontWeight: '600' },
  sportChip:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  sportChipText:    { fontSize: 12, fontWeight: '700', color: Palette.primary },

  advanceBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0' },
  advanceBtnText:   { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  advanceBtnSub:    { fontSize: 11, color: '#64748B', marginTop: 1 },
  advanceBtnArrow:  { fontSize: 22, color: '#94A3B8' },

  tableWrap:        { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, overflow: 'hidden' },
  tableHeader:      { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableScroll:      { maxHeight: 340 },
  tableRow:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableRowAlt:      { backgroundColor: '#FAFBFC' },
  timeCol:          { width: TIME_W, paddingVertical: 8, paddingHorizontal: 6, justifyRightWidth: 1, borderRightColor: '#E2E8F0', justifyContent: 'center' },
  courtCol:         { width: COURT_W, padding: 4, alignItems: 'center', justifyContent: 'center' },
  headerText:       { fontSize: 11, fontWeight: '800', color: '#64748B', textAlign: 'center' },
  timeIcon:         { fontSize: 12 },
  timeText:         { fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 },
  cell:             { width: '100%', minHeight: 36, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 2 },
  cellSelected:     { shadowColor: Palette.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 3 },
  cellText:         { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  bookBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Palette.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  bookBtnIcon:      { fontSize: 16 },
  bookBtnText:      { color: '#fff', fontSize: 13, fontWeight: '800', flexShrink: 1, textAlign: 'center' },
});
