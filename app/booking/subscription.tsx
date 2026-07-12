import { Palette, Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

type Frequency = 'weekly' | 'biweekly' | 'monthly';
type Duration  = '1month' | '3months' | '6months' | '12months';

const FREQUENCIES: { key: Frequency; label: string; desc: string }[] = [
  { key: 'weekly',   label: 'Weekly',    desc: 'Same day & time every week'     },
  { key: 'biweekly', label: 'Bi-weekly', desc: 'Same day & time every 2 weeks'  },
  { key: 'monthly',  label: 'Monthly',   desc: 'Same day & time once a month'   },
];

const DURATIONS: { key: Duration; label: string; months: number }[] = [
  { key: '1month',   label: '1 Month',   months: 1  },
  { key: '3months',  label: '3 Months',  months: 3  },
  { key: '6months',  label: '6 Months',  months: 6  },
  { key: '12months', label: '12 Months', months: 12 },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// All slots from 6 AM to midnight
const ALL_SLOTS = [
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00','24:00',
];

function to12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  if (h === 24) return '12:00 AM';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function toMins(t: string) {
  const [h] = t.split(':').map(Number);
  return h * 60;
}

function calcSessions(freq: Frequency, months: number): number {
  const weeks = months * 4.33;
  if (freq === 'weekly')   return Math.round(weeks);
  if (freq === 'biweekly') return Math.round(weeks / 2);
  return months;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId: string; courtName: string; price: string }>();

  const pricePerHour = parseFloat(params.price ?? '20');
  const courtName    = params.courtName ?? 'Court';

  const [frequency,  setFrequency]  = useState<Frequency>('weekly');
  const [duration,   setDuration]   = useState<Duration>('1month');
  const [day,        setDay]        = useState(1);
  const [startTime,  setStartTime]  = useState<string | null>(null);
  const [endTime,    setEndTime]    = useState<string | null>(null);
  const [autoRenew,  setAutoRenew]  = useState(true);

  const freqObj  = FREQUENCIES.find((f) => f.key === frequency)!;
  const durObj   = DURATIONS.find((d) => d.key === duration)!;
  const sessions = calcSessions(frequency, durObj.months);
  const hours    = startTime && endTime ? (toMins(endTime) - toMins(startTime)) / 60 : 0;
  const total    = sessions * pricePerHour * hours;

  // Valid start slots (exclude midnight)
  const validStarts = ALL_SLOTS.filter(t => t !== '24:00');

  // Valid end slots: must be after start
  const validEnds = startTime
    ? ALL_SLOTS.filter(t => toMins(t) > toMins(startTime))
    : [];

  const handleSelectStart = (t: string) => {
    setStartTime(t);
    setEndTime(null);
  };

  const canSubscribe = !!startTime && !!endTime && hours > 0;

  const handleSubscribe = () => {
    if (!canSubscribe) return;
    router.push({
      pathname: '/booking/confirmation',
      params: {
        courtId:       params.courtId,
        courtName,
        date:          `Every ${DAYS[day]}`,
        startTime:     startTime!,
        endTime:       endTime!,
        duration:      hours.toString(),
        grandTotal:    total.toFixed(2),
        bookingId:     `SUB-${Date.now().toString(36).toUpperCase()}`,
        paymentMethod: 'subscription',
      },
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Repeat Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Court banner */}
        <View style={[s.courtBanner, shadowSm]}>
          <Text style={s.courtBannerEmoji}>🏓</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.courtBannerName}>{courtName}</Text>
            <Text style={s.courtBannerPrice}>₱{pricePerHour}/hr · Lapu-Lapu, Cebu</Text>
          </View>
        </View>

        {/* Frequency */}
        <Text style={s.sectionTitle}>Repeat Frequency</Text>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.optionRow, frequency === f.key && s.optionRowActive]}
            onPress={() => setFrequency(f.key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: frequency === f.key }}
          >
            <View style={s.optionLeft}>
              <Text style={[s.optionLabel, frequency === f.key && { color: Palette.primary }]}>{f.label}</Text>
              <Text style={s.optionDesc}>{f.desc}</Text>
            </View>
            <View style={[s.radio, frequency === f.key && s.radioActive]}>
              {frequency === f.key && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Day of week */}
        <Text style={s.sectionTitle}>Day of Week</Text>
        <View style={s.dayRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={d}
              style={[s.dayChip, day === i && s.dayChipActive]}
              onPress={() => setDay(i)}
              accessibilityRole="button"
              accessibilityLabel={d}
            >
              <Text style={[s.dayChipText, day === i && s.dayChipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Time */}
        <Text style={s.sectionTitle}>Start Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeRow}>
          {validStarts.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.timeChip, startTime === t && s.timeChipActive]}
              onPress={() => handleSelectStart(t)}
              accessibilityRole="button"
              accessibilityLabel={to12h(t)}
            >
              <Text style={[s.timeChipText, startTime === t && s.timeChipTextActive]}>{to12h(t)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* End Time */}
        {startTime && (
          <>
            <Text style={s.sectionTitle}>End Time</Text>
            <Text style={s.sectionSub}>Must be after {to12h(startTime)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeRow}>
              {validEnds.map((t) => {
                const hrs = (toMins(t) - toMins(startTime)) / 60;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[s.timeChip, endTime === t && s.timeChipActive]}
                    onPress={() => setEndTime(t)}
                    accessibilityRole="button"
                    accessibilityLabel={to12h(t)}
                  >
                    <Text style={[s.timeChipText, endTime === t && s.timeChipTextActive]}>{to12h(t)}</Text>
                    <Text style={[s.timeChipSub, endTime === t && s.timeChipSubActive]}>{hrs}h</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Subscription Period */}
        <Text style={s.sectionTitle}>Subscription Period</Text>
        <View style={s.durationGrid}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[s.durCard, duration === d.key && s.durCardActive]}
              onPress={() => setDuration(d.key)}
              accessibilityRole="button"
              accessibilityLabel={d.label}
            >
              <Text style={[s.durLabel, duration === d.key && { color: Palette.primary }]}>{d.label}</Text>
              <Text style={s.durSessions}>{calcSessions(frequency, d.months)} sessions</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Auto-renew */}
        <View style={[s.autoRenewRow, shadowSm]}>
          <View style={{ flex: 1 }}>
            <Text style={s.autoRenewLabel}>Auto-renew</Text>
            <Text style={s.autoRenewDesc}>Automatically continue when period ends</Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ false: Palette.grey300, true: Palette.primary }}
            thumbColor="#fff"
            accessibilityLabel="Auto-renew subscription"
          />
        </View>

        {/* Summary */}
        <View style={[s.summaryCard, shadowMd]}>
          <Text style={s.summaryTitle}>Subscription Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Court</Text>
            <Text style={s.summaryValue}>{courtName}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Schedule</Text>
            <Text style={s.summaryValue}>Every {DAYS[day]}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Time</Text>
            <Text style={s.summaryValue}>
              {startTime && endTime ? `${to12h(startTime)} – ${to12h(endTime)}` : '—'}
            </Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Duration per session</Text>
            <Text style={s.summaryValue}>{hours > 0 ? `${hours} hr${hours !== 1 ? 's' : ''}` : '—'}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Frequency</Text>
            <Text style={s.summaryValue}>{freqObj.label}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Period</Text>
            <Text style={s.summaryValue}>{durObj.label} ({sessions} sessions)</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Rate</Text>
            <Text style={s.summaryValue}>₱{pricePerHour}/hr</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryTotalLabel}>Total</Text>
            <Text style={s.summaryTotalValue}>{hours > 0 ? `₱${total.toFixed(2)}` : '—'}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={s.termsNote}>
          <Text style={s.termsText}>
            📋 Cancellations must be made 24 hours before each session. Auto-renew can be turned off anytime from your bookings.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View>
          <Text style={s.footerTotal}>{hours > 0 ? `₱${total.toFixed(2)}` : '—'}</Text>
          <Text style={s.footerLabel}>{sessions} sessions · {durObj.label}</Text>
        </View>
        <TouchableOpacity
          style={[s.subscribeBtn, !canSubscribe && s.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={!canSubscribe}
          accessibilityRole="button"
          accessibilityLabel="Subscribe"
        >
          <Text style={s.subscribeBtnText}>🔄 Subscribe Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F8FAFC' },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', maxWidth: 480, alignSelf: 'center', width: '100%' },
  backBtn: { width: 40 },
  backIcon:{ fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:   { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  body:    { padding: Spacing.md, gap: Spacing.sm, alignSelf: 'center', width: '100%', maxWidth: 480 },

  courtBanner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, gap: Spacing.md },
  courtBannerEmoji:  { fontSize: 36 },
  courtBannerName:   { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  courtBannerPrice:  { fontSize: 12, color: '#64748B', marginTop: 2 },

  sectionTitle:      { fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: Spacing.sm },
  sectionSub:        { fontSize: 12, color: Palette.grey500, marginBottom: Spacing.xs },

  optionRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, borderWidth: 1.5, borderColor: '#E2E8F0' },
  optionRowActive:   { borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  optionLeft:        { flex: 1 },
  optionLabel:       { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  optionDesc:        { fontSize: 12, color: '#64748B', marginTop: 2 },
  radio:             { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  radioActive:       { borderColor: Palette.primary },
  radioDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.primary },

  dayRow:            { flexDirection: 'row', gap: Spacing.sm },
  dayChip:           { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  dayChipActive:     { backgroundColor: Palette.primary, borderColor: Palette.primary },
  dayChipText:       { fontSize: 12, fontWeight: '600', color: '#64748B' },
  dayChipTextActive: { color: '#fff' },

  timeRow:           { paddingBottom: 4, gap: Spacing.sm },
  timeChip:          { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', minWidth: 80 },
  timeChipActive:    { backgroundColor: Palette.primary, borderColor: Palette.primary },
  timeChipText:      { fontSize: 12, fontWeight: '600', color: '#64748B' },
  timeChipTextActive:{ color: '#fff' },
  timeChipSub:       { fontSize: 10, color: Palette.grey400, marginTop: 2 },
  timeChipSubActive: { color: 'rgba(255,255,255,0.8)' },

  durationGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  durCard:           { width: (Math.min(W, 480) - Spacing.md * 2 - Spacing.sm * 2) / 2 - 1, backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  durCardActive:     { borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  durLabel:          { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  durSessions:       { fontSize: 11, color: '#64748B', marginTop: 4 },

  autoRenewRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, gap: Spacing.md },
  autoRenewLabel:    { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  autoRenewDesc:     { fontSize: 12, color: '#64748B', marginTop: 2 },

  summaryCard:       { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md },
  summaryTitle:      { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.md },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel:      { fontSize: 13, color: '#64748B' },
  summaryValue:      { fontSize: 13, color: '#0F172A', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: Spacing.sm },
  summaryDivider:    { height: 1, backgroundColor: '#E2E8F0', marginVertical: Spacing.sm },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  summaryTotalValue: { fontSize: 18, fontWeight: '900', color: Palette.primary },

  termsNote:         { backgroundColor: '#FFF8E1', borderRadius: 12, padding: Spacing.md },
  termsText:         { fontSize: 12, color: '#92400E', lineHeight: 18 },

  footer:            { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  footerTotal:       { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  footerLabel:       { fontSize: 12, color: '#64748B', marginTop: 2 },
  subscribeBtn:      { backgroundColor: Palette.primary, paddingHorizontal: Spacing.lg, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subscribeBtnDisabled: { backgroundColor: Palette.grey300 },
  subscribeBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});
