import { Palette, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How do I book a court?',
    a: 'Go to the Home screen and tap "Book a Slot", or visit the Courts tab. Select a date, court, and available time slot, then proceed to payment.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Go to My Bookings, find the booking and tap "Cancel". Free cancellations are allowed up to 24 hours before your session. Cancellations within 24 hours may incur a 50% fee.',
  },
  {
    q: 'How do I pay for my booking?',
    a: 'We accept GCash, Maya, Credit/Debit Card, and PayPal. After confirming your booking, go to Payments → Pending to complete payment.',
  },
  {
    q: 'What is the QR check-in ticket?',
    a: 'After completing payment, you receive a unique QR code. Show it at the court entrance — staff will scan it to confirm your booking.',
  },
  {
    q: 'How does Repeat Booking work?',
    a: 'In My Bookings, tap "🔄 Repeat" to set up a recurring schedule (weekly, bi-weekly, or monthly). You\'ll get a discount for weekly bookings.',
  },
  {
    q: 'What if a court is fully booked?',
    a: 'All time slots showing "Booked" in red are unavailable. Check a different time, date, or court. The calendar refreshes in real time.',
  },
  {
    q: 'How do I get directions to the court?',
    a: 'Open the Courts tab, tap the court, then tap "🧭 Get Directions". This opens Google Maps with turn-by-turn navigation to the court.',
  },
  {
    q: 'Can I change my booking time?',
    a: 'Currently, to change a booking time you need to cancel and re-book. We are working on a reschedule feature — stay tuned.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Cancellations 24+ hours before the session receive a full refund within 3–5 business days. Cancellations within 24 hours receive a 50% refund. No-shows are not refunded.',
  },
  {
    q: 'How do I contact the court directly?',
    a: 'Each court\'s phone number is listed on its detail page under Contact. You can also reach us via the contact options below.',
  },
];

// ─── Contact options ──────────────────────────────────────────────────────────
const CONTACTS = [
  { icon: '📱', label: 'Call Us',        sub: '+63 32 888 1234',    action: () => Linking.openURL('tel:+63328881234')              },
  { icon: '💬', label: 'WhatsApp',       sub: '+63 917 123 4567',   action: () => Linking.openURL('https://wa.me/639171234567')    },
  { icon: '✉️', label: 'Email Support',  sub: 'support@picklepro.ph',action: () => Linking.openURL('mailto:support@picklepro.ph')  },
  { icon: '📘', label: 'Facebook Page',  sub: 'fb.com/PickleProPH', action: () => WebBrowser.openBrowserAsync('https://facebook.com') },
  { icon: '🗺️', label: 'Visit Us',       sub: '8X66+R3 Lapu-Lapu, Cebu', action: () => WebBrowser.openBrowserAsync('https://maps.google.com/?q=10.31216,123.96019') },
];

// ─── Accordion FAQ item ───────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={f.wrap}>
      <TouchableOpacity style={f.question} onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={q} accessibilityState={{ expanded: open }}>
        <Text style={f.qText}>{q}</Text>
        <Text style={[f.arrow, open && f.arrowOpen]}>›</Text>
      </TouchableOpacity>
      {open && <Text style={f.answer}>{a}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap:      { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  question:  { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  qText:     { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A', lineHeight: 20 },
  arrow:     { fontSize: 20, color: Palette.grey400, transform: [{ rotate: '0deg' }] },
  arrowOpen: { transform: [{ rotate: '90deg' }], color: Palette.primary },
  answer:    { fontSize: 13, color: '#64748B', lineHeight: 20, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
});

export default function HelpSupportScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [msgName,  setMsgName]  = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgText,  setMsgText]  = useState('');
  const [sending,  setSending]  = useState(false);

  const filteredFaqs = FAQS.filter((faq) =>
    faq.q.toLowerCase().includes(search.toLowerCase()) ||
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!msgName.trim() || !msgEmail.trim() || !msgText.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields before sending.'); return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setMsgName(''); setMsgEmail(''); setMsgText('');
    Alert.alert('Message Sent ✅', 'We\'ll get back to you within 24 hours. Thank you!');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={[s.hero, shadowSm]}>
          <Text style={s.heroEmoji}>🏓</Text>
          <Text style={s.heroTitle}>How can we help?</Text>
          <Text style={s.heroSub}>Search FAQs or contact our support team</Text>
        </View>

        {/* Search FAQs */}
        <View style={[s.searchWrap, shadowSm]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Search FAQs…" placeholderTextColor={Palette.grey400} value={search} onChangeText={setSearch} accessibilityLabel="Search FAQs" />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: Palette.grey400, fontSize: 16 }}>✕</Text></TouchableOpacity>}
        </View>

        {/* FAQs */}
        <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
        <View style={[s.card, shadowSm]}>
          {filteredFaqs.length === 0
            ? <Text style={s.noResults}>No results for "{search}"</Text>
            : filteredFaqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)
          }
        </View>

        {/* Contact options */}
        <Text style={s.sectionTitle}>Contact Us</Text>
        <View style={[s.card, shadowSm]}>
          {CONTACTS.map((c, idx) => (
            <TouchableOpacity key={c.label} style={[s.contactRow, idx > 0 && s.rowDivider]} onPress={c.action} accessibilityRole="button" accessibilityLabel={c.label}>
              <View style={s.contactIconWrap}><Text style={s.contactIcon}>{c.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>{c.label}</Text>
                <Text style={s.contactSub}>{c.sub}</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Send a message */}
        <Text style={s.sectionTitle}>Send a Message</Text>
        <View style={[s.card, shadowSm]}>
          <Text style={s.fieldLabel}>Your Name</Text>
          <TextInput style={s.input} value={msgName} onChangeText={setMsgName} placeholder="Juan dela Cruz" placeholderTextColor={Palette.grey400} autoCapitalize="words" accessibilityLabel="Your name" />

          <Text style={s.fieldLabel}>Email Address</Text>
          <TextInput style={s.input} value={msgEmail} onChangeText={setMsgEmail} placeholder="you@example.com" placeholderTextColor={Palette.grey400} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Your email" />

          <Text style={s.fieldLabel}>Message</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={msgText}
            onChangeText={setMsgText}
            placeholder="Describe your issue or question…"
            placeholderTextColor={Palette.grey400}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Your message"
          />

          <TouchableOpacity style={[s.sendBtn, sending && { opacity: 0.6 }]} onPress={handleSend} disabled={sending} accessibilityRole="button" accessibilityLabel="Send message">
            <Text style={s.sendBtnText}>{sending ? 'Sending…' : '✉️ Send Message'}</Text>
          </TouchableOpacity>
        </View>

        {/* Operating hours */}
        <View style={[s.hoursCard, shadowSm]}>
          <Text style={s.hoursTitle}>⏰ Support Hours</Text>
          <Text style={s.hoursText}>Monday – Saturday: 8:00 AM – 8:00 PM</Text>
          <Text style={s.hoursText}>Sunday: 9:00 AM – 5:00 PM</Text>
          <Text style={s.hoursNote}>We typically respond within 2–4 hours during support hours.</Text>
        </View>

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
  title:   { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  body:    { padding: Spacing.md, gap: Spacing.md },
  hero:    { backgroundColor: Palette.primary, borderRadius: 20, padding: Spacing.xl, alignItems: 'center' },
  heroEmoji:{ fontSize: 48, marginBottom: Spacing.sm },
  heroTitle:{ fontSize: 22, fontWeight: '900', color: '#fff' },
  heroSub:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 8 },
  searchIcon:  { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  sectionTitle:{ fontSize: 15, fontWeight: '800', color: '#0F172A' },
  card:        { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  noResults:   { textAlign: 'center', color: '#64748B', padding: Spacing.lg },
  contactRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 15, gap: Spacing.md },
  rowDivider:  { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  contactIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactIcon: { fontSize: 18 },
  contactLabel:{ fontSize: 14, fontWeight: '700', color: '#0F172A' },
  contactSub:  { fontSize: 12, color: '#64748B', marginTop: 1 },
  chevron:     { fontSize: 20, color: '#64748B' },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: Spacing.sm, marginHorizontal: Spacing.md },
  input:       { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC', marginHorizontal: Spacing.md },
  textarea:    { height: 100, textAlignVertical: 'top' },
  sendBtn:     { backgroundColor: Palette.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', margin: Spacing.md, marginTop: Spacing.md },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  hoursCard:   { backgroundColor: '#FFF8E1', borderRadius: 16, padding: Spacing.md },
  hoursTitle:  { fontSize: 15, fontWeight: '800', color: '#92400E', marginBottom: Spacing.sm },
  hoursText:   { fontSize: 13, color: '#78350F', marginBottom: 4 },
  hoursNote:   { fontSize: 12, color: '#92400E', marginTop: Spacing.sm, fontStyle: 'italic' },
});
