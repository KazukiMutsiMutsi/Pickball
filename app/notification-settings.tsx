import { Palette, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReminderTime = '15min' | '30min' | '1hr' | '2hr' | '1day';

const REMINDER_OPTIONS: { key: ReminderTime; label: string }[] = [
  { key: '15min', label: '15 minutes before' },
  { key: '30min', label: '30 minutes before' },
  { key: '1hr',   label: '1 hour before'     },
  { key: '2hr',   label: '2 hours before'    },
  { key: '1day',  label: '1 day before'      },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // ── Push notification toggles ──
  const [pushEnabled,     setPushEnabled]     = useState(true);
  const [bookingConfirm,  setBookingConfirm]  = useState(true);
  const [bookingReminder, setBookingReminder] = useState(true);
  const [paymentAlerts,   setPaymentAlerts]   = useState(true);
  const [cancellations,   setCancellations]   = useState(true);
  const [promos,          setPromos]          = useState(false);
  const [newCourts,       setNewCourts]       = useState(true);
  const [subscriptionRenew,setSubscriptionRenew]=useState(true);

  // ── Email toggles ──
  const [emailEnabled,    setEmailEnabled]    = useState(true);
  const [emailBooking,    setEmailBooking]    = useState(true);
  const [emailPayment,    setEmailPayment]    = useState(true);
  const [emailPromos,     setEmailPromos]     = useState(false);
  const [emailWeekly,     setEmailWeekly]     = useState(true);

  // ── Reminder timing ──
  const [reminderTime,    setReminderTime]    = useState<ReminderTime>('1hr');

  // ── Do not disturb ──
  const [dndEnabled,      setDndEnabled]      = useState(false);
  const [dndStart,        setDndStart]        = useState('10:00 PM');
  const [dndEnd,          setDndEnd]          = useState('7:00 AM');

  const handleSave = () => {
    // TODO: persist to backend / AsyncStorage
    Alert.alert('Saved', 'Notification preferences updated.');
    router.back();
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <View style={s.sectionTitleRow}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );

  const ToggleRow = ({
    label, desc, value, onToggle, disabled,
  }: { label: string; desc?: string; value: boolean; onToggle: () => void; disabled?: boolean }) => (
    <View style={[s.toggleRow, disabled && { opacity: 0.45 }]}>
      <View style={{ flex: 1, marginRight: Spacing.sm }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {desc && <Text style={s.toggleDesc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#E2E8F0', true: Palette.primary }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Notification Settings</Text>
        <TouchableOpacity onPress={handleSave} style={s.saveBtn} accessibilityRole="button" accessibilityLabel="Save">
          <Text style={s.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Push master toggle ── */}
        <View style={[s.masterCard, shadowSm]}>
          <View style={s.masterLeft}>
            <View>
              <Text style={s.masterLabel}>Push Notifications</Text>
              <Text style={s.masterDesc}>Receive alerts on your device</Text>
            </View>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#E2E8F0', true: Palette.primary }} thumbColor="#fff" accessibilityLabel="Push notifications master toggle" />
        </View>

        {/* ── Booking notifications ── */}
        <SectionTitle title="Booking Alerts" />
        <View style={[s.card, shadowSm]}>
          <ToggleRow label="Booking Confirmed"  desc="When a booking is approved"             value={bookingConfirm}  onToggle={() => setBookingConfirm(v => !v)}  disabled={!pushEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Booking Reminders"  desc="Before your session starts"             value={bookingReminder} onToggle={() => setBookingReminder(v => !v)} disabled={!pushEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Cancellations"       desc="When a booking is cancelled or changed" value={cancellations}   onToggle={() => setCancellations(v => !v)}   disabled={!pushEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Subscription Renewal"desc="Before auto-renew charges"             value={subscriptionRenew} onToggle={() => setSubscriptionRenew(v => !v)} disabled={!pushEnabled} />
        </View>

        {/* ── Reminder timing ── */}
        {bookingReminder && pushEnabled && (
          <>
            <SectionTitle title="Reminder Timing" />
            <View style={[s.card, shadowSm]}>
              {REMINDER_OPTIONS.map((opt, i) => (
                <React.Fragment key={opt.key}>
                  {i > 0 && <View style={s.rowDivider} />}
                  <TouchableOpacity style={s.reminderRow} onPress={() => setReminderTime(opt.key)} accessibilityRole="radio" accessibilityState={{ checked: reminderTime === opt.key }}>
                    <Text style={[s.reminderLabel, reminderTime === opt.key && { color: Palette.primary, fontWeight: '700' }]}>{opt.label}</Text>
                    <View style={[s.radio, reminderTime === opt.key && s.radioActive]}>
                      {reminderTime === opt.key && <View style={s.radioDot} />}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* ── Payment & promotions ── */}
        <SectionTitle title="Payments & Offers" />
        <View style={[s.card, shadowSm]}>
          <ToggleRow label="Payment Alerts"    desc="Successful payments & refunds"   value={paymentAlerts} onToggle={() => setPaymentAlerts(v => !v)} disabled={!pushEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="New Courts & Updates" desc="When new courts are added"    value={newCourts}    onToggle={() => setNewCourts(v => !v)}    disabled={!pushEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Promotions & Discounts" desc="Special offers and promo codes" value={promos}   onToggle={() => setPromos(v => !v)}    disabled={!pushEnabled} />
        </View>

        {/* ── Email ── */}
        <View style={[s.masterCard, shadowSm]}>
          <View style={s.masterLeft}>
            <View>
              <Text style={s.masterLabel}>Email Notifications</Text>
              <Text style={s.masterDesc}>Receive emails for important updates</Text>
            </View>
          </View>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#E2E8F0', true: Palette.primary }} thumbColor="#fff" accessibilityLabel="Email notifications toggle" />
        </View>

        <View style={[s.card, shadowSm]}>
          <ToggleRow label="Booking Confirmation" desc="Email receipt for each booking" value={emailBooking} onToggle={() => setEmailBooking(v => !v)} disabled={!emailEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Payment Receipts"     desc="Invoice after each payment"    value={emailPayment} onToggle={() => setEmailPayment(v => !v)} disabled={!emailEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Weekly Summary"       desc="Your bookings recap every Monday" value={emailWeekly} onToggle={() => setEmailWeekly(v => !v)} disabled={!emailEnabled} />
          <View style={s.rowDivider} />
          <ToggleRow label="Promotions"           desc="Deals and discount codes"     value={emailPromos}  onToggle={() => setEmailPromos(v => !v)}  disabled={!emailEnabled} />
        </View>

        {/* ── Do Not Disturb ── */}
        <SectionTitle title="Do Not Disturb" />
        <View style={[s.card, shadowSm]}>
          <ToggleRow label="Enable Do Not Disturb" desc="Silence all notifications during set hours" value={dndEnabled} onToggle={() => setDndEnabled(v => !v)} />
          {dndEnabled && (
            <>
              <View style={s.rowDivider} />
              <View style={s.dndTimeRow}>
                <View style={s.dndTimeItem}>
                  <Text style={s.dndTimeLabel}>From</Text>
                  <View style={s.dndTimePill}>
                    <Text style={s.dndTimeValue}>{dndStart}</Text>
                  </View>
                </View>
                <Text style={s.dndTimeSep}>→</Text>
                <View style={s.dndTimeItem}>
                  <Text style={s.dndTimeLabel}>Until</Text>
                  <View style={s.dndTimePill}>
                    <Text style={s.dndTimeValue}>{dndEnd}</Text>
                  </View>
                </View>
              </View>
              <Text style={s.dndNote}>Booking reminders will still come through for same-day sessions.</Text>
            </>
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity style={s.saveBtnFull} onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save notification settings">
          <Text style={s.saveBtnFullText}>Save Preferences</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F8FAFC' },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40 },
  backIcon:{ fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:   { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0F172A' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Palette.primary, borderRadius: 100 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  body:    { padding: Spacing.md, gap: Spacing.sm },

  // Master card
  masterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, gap: Spacing.md },
  masterLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  masterLabel:{ fontSize: 15, fontWeight: '700', color: '#0F172A' },
  masterDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // Section title
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Card
  card:       { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  rowDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: Spacing.md },

  // Toggle row
  toggleRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  toggleLabel:{ fontSize: 14, fontWeight: '500', color: '#0F172A' },
  toggleDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // Reminder
  reminderRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  reminderLabel:{ flex: 1, fontSize: 14, color: '#0F172A' },
  radio:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  radioActive:  { borderColor: Palette.primary },
  radioDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.primary },

  // DND
  dndTimeRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  dndTimeItem:  { flex: 1, alignItems: 'center', gap: 4 },
  dndTimeLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  dndTimePill:  { backgroundColor: Palette.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  dndTimeValue: { fontSize: 14, color: Palette.primary, fontWeight: '700' },
  dndTimeSep:   { fontSize: 16, color: '#64748B' },
  dndNote:      { fontSize: 11, color: '#64748B', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, lineHeight: 16 },

  // Save
  saveBtnFull:     { backgroundColor: Palette.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  saveBtnFullText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
