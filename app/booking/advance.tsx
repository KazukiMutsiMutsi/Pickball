import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getNext30Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function AdvanceBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId: string; courtName: string; price: string }>();

  const days     = getNext30Days();
  const todayISO = toISO(new Date());

  // Group by month
  const byMonth: { label: string; days: Date[] }[] = [];
  days.forEach(d => {
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    const last  = byMonth[byMonth.length - 1];
    if (!last || last.label !== label) byMonth.push({ label, days: [d] });
    else last.days.push(d);
  });

  // Tap a date → go to time screen
  const handleSelectDate = (iso: string) => {
    router.push({ pathname: '/booking/time', params: { ...params, date: iso } });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Advanced Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        <Text style={s.courtName}>{params.courtName}</Text>
        <Text style={s.hint}>📅 Select any date within the next <Text style={s.hintBold}>30 days</Text></Text>

        {byMonth.map(group => (
          <View key={group.label} style={s.group}>
            <Text style={s.groupLabel}>{group.label}</Text>
            <View style={s.chipRow}>
              {group.days.map(d => {
                const iso     = toISO(d);
                const isToday = iso === todayISO;
                return (
                  <TouchableOpacity
                    key={iso}
                    style={s.chip}
                    onPress={() => handleSelectDate(iso)}
                    accessibilityRole="button"
                    accessibilityLabel={formatFull(iso)}
                  >
                    <Text style={s.chipDay}>{DAY_NAMES[d.getDay()]}</Text>
                    <Text style={s.chipNum}>{d.getDate()}</Text>
                    {isToday && <View style={s.todayDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F8FAFC' },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.grey200, backgroundColor: '#fff', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn:    { width: 40 },
  backIcon:   { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:      { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  body:       { padding: Spacing.md, alignSelf: 'center', width: '100%', maxWidth: 480 },
  courtName:  { fontSize: 17, fontWeight: '800', color: Palette.grey900, marginBottom: Spacing.xs },
  hint:       { fontSize: 13, color: Palette.grey600, backgroundColor: Palette.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.lg },
  hintBold:   { fontWeight: '700', color: Palette.primary },
  group:      { marginBottom: Spacing.lg },
  groupLabel: { fontSize: 14, fontWeight: '700', color: Palette.grey700, marginBottom: Spacing.sm },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip:       { width: 56, height: 68, borderRadius: Radius.md, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Palette.grey200, gap: 2 },
  chipDay:    { fontSize: 11, fontWeight: '600', color: Palette.grey500 },
  chipNum:    { fontSize: 20, fontWeight: '800', color: Palette.grey900 },
  todayDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: Palette.primary },
});
