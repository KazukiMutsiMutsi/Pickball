import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadow, shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Find Courts',  color: '#E8F4FD', accent: '#1A8FE3', route: '/courts'           },
  { icon: '📋', label: 'My Bookings', color: '#FFF3E0', accent: '#F39C12', route: '/(tabs)/bookings'  },
  { icon: '💳', label: 'Pay Online',  color: '#F3E5F5', accent: '#8E44AD', route: '/(tabs)/payments'  },
  { icon: '🔔', label: 'Alerts',      color: '#FCE4EC', accent: '#E91E63', route: '/notifications'    },
];

// ─── Upcoming bookings ────────────────────────────────────────────────────────
const UPCOMING = [
  { id: '1', court: 'Downtown Pickleball Center', date: 'Today',    time: '6:00 PM', status: 'confirmed', amount: 420 },
  { id: '2', court: 'Riverside Courts',           date: 'Tomorrow', time: '9:00 AM', status: 'confirmed', amount: 315 },
  { id: '3', court: 'Sunset Pavilion',            date: 'Jul 15',   time: '7:00 PM', status: 'pending',   amount: 378 },
];

// ─── Calendar data ────────────────────────────────────────────────────────────
const CAL_COURTS = [
  { id: '1', name: 'Downtown Center',  pricePerHour: 20 },
  { id: '2', name: 'Riverside Courts', pricePerHour: 15 },
  { id: '3', name: 'Sunset Pavilion',  pricePerHour: 18 },
  { id: '4', name: 'Northpark Arena',  pricePerHour: 22 },
  { id: '5', name: 'Bayview Courts',   pricePerHour: 12 },
];

const HOURS = [
  '6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM',
];

const MOCK_BOOKED: Record<string, Record<string, string[]>> = {
  '1': { '0': ['9:00 AM','10:00 AM'],                          '1': ['7:00 AM','2:00 PM'],              '2': ['6:00 PM','7:00 PM'] },
  '2': { '0': ['7:00 AM','3:00 PM'],                           '1': ['9:00 AM','10:00 AM','11:00 AM'],  '2': ['8:00 AM'] },
  '3': { '0': ['6:00 PM','7:00 PM','8:00 PM'],                 '1': ['10:00 AM'],                       '2': ['1:00 PM','2:00 PM'] },
  '4': { '0': ['9:00 AM','10:00 AM','11:00 AM','12:00 PM'],    '1': ['6:00 PM','7:00 PM'],              '2': [] },
  '5': { '0': [],                                              '1': ['8:00 AM','9:00 AM'],              '2': ['3:00 PM','4:00 PM'] },
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

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Section header ───────────────────────────────────────────────────────────
function SH({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
          <Text style={sh.link}>See all →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  title: { fontSize: 17, fontWeight: '800', color: Palette.grey900 },
  link:  { fontSize: 13, color: Palette.primary, fontWeight: '600' },
});

// ─── Upcoming booking card ────────────────────────────────────────────────────
function BookingCard({ item, onPress }: { item: typeof UPCOMING[0]; onPress: () => void }) {
  const c = item.status === 'pending' ? Palette.warning : Palette.success;
  return (
    <TouchableOpacity style={[bk.card, shadowSm]} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.court}>
      <View style={[bk.accent, { backgroundColor: c }]} />
      <View style={bk.body}>
        <View style={bk.row}>
          <Text style={bk.court} numberOfLines={1}>{item.court}</Text>
          <View style={[bk.badge, { backgroundColor: c + '22' }]}>
            <Text style={[bk.badgeText, { color: c }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={bk.meta}>📅 {item.date} · 🕐 {item.time}</Text>
        <Text style={bk.amount}>₱{item.amount.toFixed(2)}</Text>
      </View>
      <Text style={bk.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const bk = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, overflow: 'hidden' },
  accent:    { width: 4, alignSelf: 'stretch' },
  body:      { flex: 1, padding: Spacing.md },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  court:     { fontSize: 14, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 8 },
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  meta:      { fontSize: 12, color: Palette.grey600, marginBottom: 4 },
  amount:    { fontSize: 14, fontWeight: '800', color: Palette.primary },
  chevron:   { fontSize: 22, color: Palette.grey400, paddingRight: Spacing.sm },
});

// ─── Inline booking calendar ──────────────────────────────────────────────────
const SLOT_W = (W - Spacing.md * 4 - Spacing.sm * 4) / 3;

function BookingCalendar() {
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

      {/* Card header */}
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

      {/* Day strip */}
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

      {/* Court strip */}
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

      {/* Stats */}
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

      {/* Legend */}
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

      {/* Slot grid */}
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

      {/* Book Now — shows when a slot is selected */}
      {selSlot && (
        <TouchableOpacity
          style={cal.bookBtn}
          onPress={() => router.push({ pathname: '/booking/date', params: { courtId: court.id, courtName: court.name, price: court.pricePerHour } })}
          accessibilityRole="button"
          accessibilityLabel={`Book ${court.name} at ${selSlot} on ${dayLbl}`}
        >
          <Text style={cal.bookBtnText}>📅  Book {court.name}  ·  {selSlot}  ·  {dayLbl}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const cal = StyleSheet.create({
  wrap:          { marginHorizontal: Spacing.md, backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md },
  cardHead:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTitle:     { fontSize: 16, fontWeight: '800', color: Palette.grey900 },
  cardSub:       { fontSize: 12, color: Palette.grey500, marginTop: 2 },
  livePill:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, gap: 4 },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.danger },
  liveText:      { fontSize: 11, color: Palette.danger, fontWeight: '700' },
  label:         { fontSize: 12, fontWeight: '700', color: Palette.grey600, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  strip:         { gap: Spacing.sm, paddingBottom: 4 },
  dayChip:       { alignItems: 'center', backgroundColor: Palette.grey50, borderRadius: Radius.md, paddingVertical: 6, paddingHorizontal: 10, minWidth: 44, borderWidth: 1.5, borderColor: Palette.grey200, position: 'relative' },
  dayChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  dayShort:      { fontSize: 10, color: Palette.grey500, fontWeight: '600' },
  dayNum:        { fontSize: 17, fontWeight: '900', color: Palette.grey900 },
  activeText:    { color: '#fff' },
  todayDot:      { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: Palette.danger },
  courtChip:     { backgroundColor: Palette.grey50, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, minWidth: 110, borderWidth: 1.5, borderColor: Palette.grey200 },
  courtChipActive:{ borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  courtName:     { fontSize: 11, fontWeight: '700', color: Palette.grey900, marginBottom: 3 },
  courtFree:     { fontSize: 10, fontWeight: '600', color: Palette.success },
  courtFull:     { fontSize: 10, fontWeight: '600', color: Palette.danger },
  statsRow:      { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  pill:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  pillText:      { fontSize: 11, fontWeight: '700' },
  legend:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:     { width: 10, height: 10, borderRadius: 3 },
  legendText:    { fontSize: 10, color: Palette.grey600 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 4 },
  slot:          { width: SLOT_W, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  slotSelected:  { borderColor: Palette.primary },
  slotTime:      { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  slotLbl:       { fontSize: 10, fontWeight: '700' },
  bookBtn:       { marginTop: Spacing.md, backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  bookBtnText:   { color: '#fff', fontSize: 13, fontWeight: '800' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const { user }  = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.notifBtn, shadowSm]} onPress={() => router.push('/notifications')} accessibilityLabel="Notifications">
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Profile">
              <View style={[styles.avatar, shadowSm]}>
                <Text style={styles.avatarText}>
                  {(user?.name ?? 'P').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity style={[styles.heroCta, shadow('lg')]} onPress={() => router.push('/courts')} accessibilityRole="button" accessibilityLabel="Book a court">
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Book a Court</Text>
            <Text style={styles.heroSub}>Find available courts and book instantly</Text>
          </View>
          <Text style={styles.heroEmoji}>🏓</Text>
        </TouchableOpacity>

        {/* Booking Calendar */}
        <SH title="Book a Slot" onSeeAll={() => router.push('/availability')} />
        <BookingCalendar />

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Palette.grey100 },
  content:      { paddingBottom: Spacing.xl },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:     { fontSize: 13, color: Palette.grey500 },
  userName:     { fontSize: 24, fontWeight: '900', color: Palette.grey900, marginTop: 1 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifIcon:    { fontSize: 18 },
  notifDot:     { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.danger, borderWidth: 2, borderColor: '#fff' },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: Palette.success, borderWidth: 2, borderColor: '#fff' },
  heroCta:      { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Palette.primary, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTitle:    { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroEmoji:    { fontSize: 52 },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:    { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 4, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  actionIcon:   { fontSize: 22 },
  actionLabel:  { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
});
