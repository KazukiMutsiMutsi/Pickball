import { Palette, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DocTab = 'terms' | 'privacy';

const LAST_UPDATED = 'July 11, 2026';

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading, installing, or using PicklePro ("the App"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App. These terms apply to all users, including visitors, registered users, and customers.',
  },
  {
    title: '2. Account Registration',
    body: 'You must be at least 13 years of age to create an account. You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate and complete information during registration and to update it as necessary.',
  },
  {
    title: '3. Booking & Cancellations',
    body: 'Court bookings are subject to availability and are confirmed only after payment is received. Free cancellations are allowed up to 24 hours before your session. Cancellations within 24 hours of the session may incur a 50% cancellation fee. No-shows are not eligible for refunds.',
  },
  {
    title: '4. Payments',
    body: 'All prices are in Philippine Peso (₱). We accept GCash, Maya, Credit/Debit Card, and PayPal. Payments are processed securely through PayMongo. PicklePro does not store card details on its servers.',
  },
  {
    title: '5. QR Code & Check-in',
    body: 'Each booking generates a unique QR code valid for one session only. You must present your QR code at the court entrance. Sharing or duplicating your QR code is prohibited and may result in account suspension.',
  },
  {
    title: '6. Repeat Bookings & Subscriptions',
    body: 'Subscription plans auto-renew at the end of each period unless cancelled at least 48 hours before renewal. You may cancel auto-renewal at any time through My Bookings. Discounts applied to subscriptions are not transferable.',
  },
  {
    title: '7. Court Rules',
    body: 'Users must follow all court rules including: non-marking court shoes, no food or drinks on court, maximum session duration during peak hours, and proper attire. Violation of court rules may result in removal without refund.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All content, logos, trademarks, and materials in the App are the property of PicklePro. You may not reproduce, distribute, or create derivative works without written permission.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'PicklePro is not liable for personal injury, property damage, or loss incurred during court use. We are not responsible for equipment failure, weather disruptions, or third-party service outages beyond our control.',
  },
  {
    title: '10. Modifications',
    body: 'We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify users of significant changes via in-app notification or email.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Lapu-Lapu City, Cebu.',
  },
  {
    title: '12. Contact',
    body: 'For questions about these Terms, contact us at legal@picklepro.ph or call +63 32 888 1234.',
  },
];

const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly: name, email address, Philippine mobile number, and payment information. We also automatically collect device information, app usage data, and location data (when permitted) to show nearby courts.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to: process and confirm bookings, send booking reminders and confirmations, process payments securely, improve app functionality and user experience, send promotional offers (if opted in), and comply with legal obligations.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell your personal data. We share data only with: payment processors (PayMongo) for transaction processing, court management systems for booking validation, and analytics providers to improve the app. All partners are bound by data protection agreements.',
  },
  {
    title: '4. Data Storage & Security',
    body: 'Your data is stored on secure servers using industry-standard encryption (AES-256). Payment card data is never stored on our servers — it is handled entirely by PCI-DSS compliant payment processors. We use HTTPS for all data transmission.',
  },
  {
    title: '5. Location Data',
    body: 'With your permission, we use your device location to show nearby courts and provide directions. Location data is not stored permanently and is not shared with third parties. You can disable location access in your device settings at any time.',
  },
  {
    title: '6. Push Notifications',
    body: 'We send push notifications for booking confirmations, reminders, and important updates. You can manage notification preferences in the app under Profile → Notification Settings, or through your device\'s notification settings.',
  },
  {
    title: '7. Cookies & Analytics',
    body: 'We use analytics tools to understand how users interact with the app. This data is aggregated and anonymized. We do not use tracking cookies for advertising purposes.',
  },
  {
    title: '8. Your Rights',
    body: 'Under Philippine law (Data Privacy Act of 2012), you have the right to: access your personal data, correct inaccurate data, request deletion of your account and data, object to data processing, and file complaints with the National Privacy Commission.',
  },
  {
    title: '9. Data Retention',
    body: 'We retain your account data for as long as your account is active. Booking records are retained for 3 years for legal and accounting purposes. You may request account deletion at any time — this will anonymize your data within 30 days.',
  },
  {
    title: '10. Children\'s Privacy',
    body: 'The App is not intended for children under 13. We do not knowingly collect data from children. If we become aware of such collection, we will delete the data immediately.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify you of changes via in-app notice or email before they take effect. Continued use of the App indicates acceptance.',
  },
  {
    title: '12. Contact',
    body: 'For privacy concerns or data requests, contact our Data Protection Officer at privacy@picklepro.ph or +63 32 888 1234.',
  },
];

function Section({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={sec.wrap}>
      <TouchableOpacity style={sec.header} onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }}>
        <Text style={sec.title}>{title}</Text>
        <Text style={[sec.arrow, open && sec.arrowOpen]}>›</Text>
      </TouchableOpacity>
      {open && <Text style={sec.body}>{body}</Text>}
    </View>
  );
}
const sec = StyleSheet.create({
  wrap:      { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  header:    { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  title:     { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 20 },
  arrow:     { fontSize: 20, color: Palette.grey400 },
  arrowOpen: { transform: [{ rotate: '90deg' }], color: Palette.primary },
  body:      { fontSize: 13, color: '#64748B', lineHeight: 22, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
});

export default function TermsPrivacyScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<DocTab>('terms');

  const sections = tab === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const title    = tab === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Terms & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab switcher */}
      <View style={s.tabRow}>
        <TouchableOpacity style={[s.tabBtn, tab === 'terms' && s.tabBtnActive]} onPress={() => setTab('terms')}>
          <Text style={[s.tabText, tab === 'terms' && s.tabTextActive]}>📋 Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, tab === 'privacy' && s.tabBtnActive]} onPress={() => setTab('privacy')}>
          <Text style={[s.tabText, tab === 'privacy' && s.tabTextActive]}>🔒 Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={[s.docHeader, shadowSm]}>
          <Text style={s.docTitle}>{title}</Text>
          <Text style={s.docMeta}>PicklePro · Last updated: {LAST_UPDATED}</Text>
          <Text style={s.docIntro}>
            {tab === 'terms'
              ? 'Please read these Terms of Service carefully before using the PicklePro app. By using our service, you agree to these terms.'
              : 'This Privacy Policy explains how PicklePro collects, uses, and protects your personal information in accordance with the Data Privacy Act of 2012.'}
          </Text>
        </View>

        {/* Sections */}
        <View style={[s.card, shadowSm]}>
          {sections.map((sec) => <Section key={sec.title} title={sec.title} body={sec.body} />)}
        </View>

        {/* Summary badge */}
        <View style={s.summaryBadge}>
          <Text style={s.summaryText}>
            {tab === 'terms'
              ? '✅ By using PicklePro, you agree to these Terms of Service.'
              : '🔒 Your data is protected under the Philippine Data Privacy Act of 2012.'}
          </Text>
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
  tabRow:  { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn:  { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Palette.primary },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: Palette.primary, fontWeight: '700' },
  body:    { padding: Spacing.md, gap: Spacing.md },
  docHeader: { backgroundColor: Palette.primary, borderRadius: 16, padding: Spacing.lg },
  docTitle:  { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  docMeta:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.sm },
  docIntro:  { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  card:      { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  summaryBadge: { backgroundColor: '#E8F8EF', borderRadius: 12, padding: Spacing.md },
  summaryText:  { fontSize: 13, color: Palette.success, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
});
