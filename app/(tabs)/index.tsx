import { formatPHP, Layout, Palette, Radius, Spacing } from '@/constants/theme';
import { getAllBookings } from '@/src/booking/bookingStore';
import { BookingCalendar } from '@/src/components/BookingCalendar';
import { useAuth } from '@/src/hooks/useAuth';
import { shadow, shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// Court used for next-slot lookup (Court 1)
const DEFAULT_COURT = { id: '1', name: 'Court 1', price: 20 };

// Operating hours: 6 AM – 11 PM
const OP_START = 6;
const OP_END   = 23;

function to12h(h: number) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${period}`;
}

function findNextFreeSlot(courtId: string, date: string): string | null {
  const nowHour  = new Date().getHours();
  const minHour  = Math.max(OP_START, nowHour + 1); // at least 1hr from now
  const bookings = getAllBookings().filter(
    b => b.courtId === courtId && b.date === date &&
         b.status !== 'cancelled' && b.status !== 'no_show',
  );
  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  for (let h = minHour; h < OP_END; h++) {
    const slotStart = h * 60;
    const slotEnd   = slotStart + 60;
    const conflict  = bookings.some(b => slotStart < toMins(b.endTime) && slotEnd > toMins(b.startTime));
    if (!conflict) return `${String(h).padStart(2, '0')}:00`;
  }
  return null;
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
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  link:  { fontSize: 13, color: Palette.primary, fontWeight: '600' },
});

// ─── Upcoming booking card ────────────────────────────────────────────────────
function BookingCard({ item, onPress }: { item: { id: string; courtName: string; date: string; startTime: string; amount: number; status: string }; onPress: () => void }) {
  const c = item.status === 'confirmed' ? Palette.success : Palette.warning;
  const to12h = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  return (
    <TouchableOpacity style={[bk.card, shadowSm]} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.courtName}>
      <View style={[bk.accent, { backgroundColor: c }]} />
      <View style={bk.body}>
        <View style={bk.row}>
          <Text style={bk.court} numberOfLines={1}>{item.courtName}</Text>
          <View style={[bk.badge, { backgroundColor: c + '22' }]}>
            <Text style={[bk.badgeText, { color: c }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={bk.meta}>📅 {item.date} · 🕐 {to12h(item.startTime)}</Text>
        <Text style={bk.amount}>{formatPHP(item.amount)}</Text>
      </View>
      <Text style={bk.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const bk = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, marginHorizontal: Spacing.md, marginBottom: 12, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  accent:    { width: 4, alignSelf: 'stretch' },
  body:      { flex: 1, padding: Spacing.md },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  court:     { fontSize: 15, fontWeight: '600', color: '#0F172A', flex: 1, marginRight: 8 },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  meta:      { fontSize: 12, color: '#64748B', marginBottom: 4 },
  amount:    { fontSize: 14, fontWeight: '800', color: Palette.primary },
  chevron:   { fontSize: 22, color: Palette.grey400, paddingRight: Spacing.sm },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const { user }  = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  // Load upcoming bookings from the shared store — refresh on every focus
  const [upcoming,  setUpcoming]  = useState<ReturnType<typeof getAllBookings>>([]);
  const [nextSlot,  setNextSlot]  = useState<string | null>(null);
  const [calOpen,   setCalOpen]   = useState(false);

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().slice(0, 10);
      const live = getAllBookings()
        .filter(b => b.status !== 'cancelled' && b.status !== 'no_show' && b.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 3);
      setUpcoming(live);
      setNextSlot(findNextFreeSlot(DEFAULT_COURT.id, today));
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pageWrap}>

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

        {/* Hero CTA — gradient effect using layered views */}
        <TouchableOpacity style={[styles.heroCta, shadow('lg')]} onPress={() => router.push('/courts')} accessibilityRole="button" accessibilityLabel="Book a court">
          {/* Dark overlay on the right for gradient illusion */}
          <View style={styles.heroGradientOverlay} />
          <View style={{ flex: 1, zIndex: 1 }}>
            <Text style={styles.heroTitle}>Book a Court</Text>
            <Text style={styles.heroSub}>Find available courts and book instantly</Text>
          </View>
          <View style={[styles.heroLogoWrap, { zIndex: 1 }]}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.heroLogo}
              contentFit="cover"
              accessibilityLabel="PicklePro logo"
            />
          </View>
        </TouchableOpacity>

        {/* Next Available Slot shortcut */}
        {nextSlot && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <TouchableOpacity
              style={[styles.nextSlotCard, shadow('sm')]}
              onPress={() => router.push({
                pathname: '/booking/time',
                params: {
                  courtId:   DEFAULT_COURT.id,
                  courtName: DEFAULT_COURT.name,
                  price:     String(DEFAULT_COURT.price),
                  date:      new Date().toISOString().slice(0, 10),
                },
              })}
              accessibilityRole="button"
              accessibilityLabel={`Book next available slot at ${to12h(parseInt(nextSlot))}`}
            >
              <View style={styles.nextSlotLeft}>
                <View style={styles.nextSlotDot} />
                <View>
                  <Text style={styles.nextSlotLabel}>Next free slot today</Text>
                  <Text style={styles.nextSlotTime}>{to12h(parseInt(nextSlot))} · {DEFAULT_COURT.name}</Text>
                </View>
              </View>
              <View style={styles.nextSlotBtn}>
                <Text style={styles.nextSlotBtnText}>Book →</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Upcoming Bookings */}
        {upcoming.length > 0 && (
          <>
            <SH title="Upcoming Bookings" onSeeAll={() => router.push('/(tabs)/bookings')} />
            {upcoming.map(item => (
              <BookingCard
                key={item.id}
                item={item}
                onPress={() => router.push('/(tabs)/bookings')}
              />
            ))}
          </>
        )}

        {/* Book a Slot — collapsible */}
        <TouchableOpacity
          style={styles.calHeader}
          onPress={() => setCalOpen(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={calOpen ? 'Collapse Book a Slot' : 'Expand Book a Slot'}
        >
          <Text style={sh.title}>Book a Slot</Text>
          <View style={styles.calHeaderRight}>
            <TouchableOpacity onPress={() => router.push('/availability')} accessibilityLabel="See all slots">
              <Text style={sh.link}>See all →</Text>
            </TouchableOpacity>
            <Text style={styles.calChevron}>{calOpen ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>
        {calOpen && <BookingCalendar />}

        <View style={{ height: Spacing.xxl }} />
        </View>{/* pageWrap */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F8FAFC' },
  content:      { paddingBottom: Spacing.xl },
  pageWrap:     { alignSelf: 'center', width: '100%', maxWidth: Layout.maxWidth },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:     { fontSize: 13, color: '#64748B' },
  userName:     { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 1 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  notifIcon:    { fontSize: 18 },
  notifDot:     { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#fff' },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },
  heroCta:           { marginHorizontal: Spacing.md, marginBottom: 12, backgroundColor: '#1A8FE3', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  heroGradientOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '60%', backgroundColor: '#0D1F35', opacity: 0.55, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  heroTitle:         { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroSub:           { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroLogoWrap: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: '#FFD700' },
  heroLogo:     { width: 64, height: 64 },
  calHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  calHeaderRight:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  calChevron:   { fontSize: 12, color: Palette.grey500, marginLeft: 4 },
  nextSlotCard: { marginHorizontal: Spacing.md, marginBottom: 12, backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: Palette.success + '40' },
  nextSlotLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  nextSlotDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.success },
  nextSlotLabel:{ fontSize: 11, color: Palette.grey500, fontWeight: '600', marginBottom: 2 },
  nextSlotTime: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  nextSlotBtn:  { backgroundColor: Palette.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  nextSlotBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:    { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 4, borderRadius: 12, paddingVertical: Spacing.md, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  actionIcon:   { fontSize: 22 },
  actionLabel:  { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
});
