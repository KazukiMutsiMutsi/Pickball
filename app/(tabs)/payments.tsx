import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PayTab = 'pending' | 'history';

// ─── Mock data ────────────────────────────────────────────────────────────────
const PENDING = [
  { id: 'BKG-002', court: 'Court 2', date: '2026-07-15', time: '2:00 PM', amount: 23.63 },
];

const HISTORY = [
  { id: 'PAY-101', court: 'Court 1', date: '2026-07-12', amount: 42.00, method: 'GCash',       status: 'paid'     },
  { id: 'PAY-100', court: 'Court 3', date: '2026-07-05', amount: 37.80, method: 'Credit Card', status: 'paid'     },
  { id: 'PAY-099', court: 'Court 2', date: '2026-06-28', amount: 46.20, method: 'Maya',        status: 'paid'     },
  { id: 'PAY-098', court: 'Court 1', date: '2026-06-15', amount: 12.60, method: 'GCash',       status: 'refunded' },
];

const METHODS = [
  { id: 'gcash', label: 'GCash', color: '#007BFF' },
];

// ─── Google-Pay-style card input ──────────────────────────────────────────────
function CardForm() {
  const [num,  setNum]  = useState('');
  const [exp,  setExp]  = useState('');
  const [cvv,  setCvv]  = useState('');
  const [name, setName] = useState('');

  const formatNum = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  return (
    <View style={cf.wrap}>
      {/* Visual card */}
      <View style={cf.cardVisual}>
        <Text style={cf.cardNum}>{num || '•••• •••• •••• ••••'}</Text>
        <View style={cf.cardBottom}>
          <View>
            <Text style={cf.cardLabel}>Card Holder</Text>
            <Text style={cf.cardValue}>{name || 'YOUR NAME'}</Text>
          </View>
          <View>
            <Text style={cf.cardLabel}>Expires</Text>
            <Text style={cf.cardValue}>{exp || 'MM/YY'}</Text>
          </View>
        </View>
      </View>

      {/* Inputs */}
      <Text style={cf.fieldLabel}>Card Number</Text>
      <TextInput style={cf.input} placeholder="1234 5678 9012 3456" placeholderTextColor={Palette.grey400} value={num} onChangeText={(t) => setNum(formatNum(t))} keyboardType="numeric" maxLength={19} accessibilityLabel="Card number" />

      <View style={cf.row2}>
        <View style={{ flex: 1 }}>
          <Text style={cf.fieldLabel}>Expiry</Text>
          <TextInput style={cf.input} placeholder="MM/YY" placeholderTextColor={Palette.grey400} value={exp} onChangeText={(t) => setExp(formatExp(t))} keyboardType="numeric" maxLength={5} accessibilityLabel="Expiry" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cf.fieldLabel}>CVV</Text>
          <TextInput style={cf.input} placeholder="•••" placeholderTextColor={Palette.grey400} value={cvv} onChangeText={(t) => setCvv(t.replace(/\D/g,'').slice(0,4))} keyboardType="numeric" secureTextEntry maxLength={4} accessibilityLabel="CVV" />
        </View>
      </View>

      <Text style={cf.fieldLabel}>Name on Card</Text>
      <TextInput style={cf.input} placeholder="Juan dela Cruz" placeholderTextColor={Palette.grey400} value={name} onChangeText={setName} autoCapitalize="words" accessibilityLabel="Name on card" />

      <View style={cf.secureNote}>
        <Text style={cf.secureText}>256-bit encrypted · PCI DSS compliant</Text>
      </View>
    </View>
  );
}

const cf = StyleSheet.create({
  wrap:        { marginTop: Spacing.sm },
  cardVisual:  { backgroundColor: Palette.primary, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardNum:     { fontSize: 18, letterSpacing: 3, color: '#fff', fontWeight: '600', marginBottom: Spacing.md },
  cardBottom:  { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  cardValue:   { fontSize: 13, color: '#fff', fontWeight: '600', marginTop: 2 },
  fieldLabel:  { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4, marginTop: Spacing.sm },
  input:       { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15, color: '#0F172A', backgroundColor: '#F8FAFC' },
  row2:        { flexDirection: 'row', gap: Spacing.sm },
  secureNote:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: Spacing.sm, marginTop: Spacing.md, gap: 8 },
  secureText:  { fontSize: 12, color: '#64748B' },
});

// ─── Payments Screen ──────────────────────────────────────────────────────────
export default function PaymentsTab() {
  const router = useRouter();
  const [tab,    setTab]    = useState<PayTab>('pending');
  const [method, setMethod] = useState('gcash');

  const totalPending = PENDING.reduce((s, p) => s + p.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
        </View>

        {/* Summary card */}
        <View style={[styles.summaryCard, shadowMd]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Pending Payment</Text>
              <Text style={styles.summaryAmount}>₱{totalPending.toFixed(2)}</Text>
            </View>
          </View>
          {PENDING.length > 0 && (
            <TouchableOpacity style={styles.payAllBtn} accessibilityRole="button" accessibilityLabel="Pay all pending">
              <Text style={styles.payAllBtnText}>Pay All Pending</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['pending', 'history'] as PayTab[]).map((t) => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)} accessibilityRole="tab">
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'pending' ? 'Pending' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Pending tab ── */}
        {tab === 'pending' && (
          <View style={styles.section}>
            {PENDING.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>All paid up!</Text>
                <Text style={styles.emptySub}>No pending payments</Text>
              </View>
            ) : (
              <>
                {PENDING.map((p) => (
                  <View key={p.id} style={[styles.pendingCard, shadowSm]}>
                    <View style={styles.pendingTop}>
                      <Text style={styles.pendingCourt}>{p.court}</Text>
                      <Text style={styles.pendingAmount}>₱{p.amount.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.pendingMeta}>{p.date} · {p.time}</Text>
                    <Text style={styles.pendingId}>{p.id}</Text>
                  </View>
                ))}

                {/* Payment method picker */}
                <Text style={styles.sectionTitle}>Choose Payment Method</Text>
                {METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodRow, method === m.id && styles.methodRowActive]}
                    onPress={() => setMethod(m.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: method === m.id }}
                  >
                    <Text style={[styles.methodLabel, method === m.id && { color: m.color, fontWeight: '700' }]}>{m.label}</Text>
                    <View style={[styles.radio, method === m.id && { borderColor: m.color }]}>
                      {method === m.id && <View style={[styles.radioDot, { backgroundColor: m.color }]} />}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Card form if card selected */}
                {method === 'card' && <CardForm />}

                {/* Pay button */}
                <TouchableOpacity
                  style={[styles.payBtn, shadowMd]}
                  onPress={() => router.push('/booking/confirmation' as any)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pay ₱${totalPending.toFixed(2)}`}
                >
                  <Text style={styles.payBtnText}>Pay ₱{totalPending.toFixed(2)}</Text>
                </TouchableOpacity>

                <Text style={styles.secureFooter}>Payments are secure and encrypted</Text>
              </>
            )}
          </View>
        )}

        {/* ── History tab ── */}
        {tab === 'history' && (
          <View style={styles.section}>
            {HISTORY.map((h) => (
              <View key={h.id} style={[styles.historyCard, shadowSm]}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyCourt}>{h.court}</Text>
                  <Text style={[styles.historyAmount, h.status === 'refunded' && { color: Palette.warning }]}>
                    {h.status === 'refunded' ? 'Refund ' : ''}₱{h.amount.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.historyMeta}>{h.date}</Text>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyId}>{h.id}</Text>
                  <View style={[styles.historyBadge, h.status === 'refunded' ? styles.historyBadgeRefund : styles.historyBadgePaid]}>
                    <Text style={[styles.historyBadgeText, { color: h.status === 'refunded' ? Palette.warning : Palette.success }]}>
                      {h.status === 'paid' ? h.method : 'Refunded'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#F8FAFC' },
  header:            { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', maxWidth: 480, alignSelf: 'center', width: '100%' },
  title:             { fontSize: 22, fontWeight: '900', color: '#0F172A' },

  summaryCard:       { marginHorizontal: Spacing.md, marginVertical: Spacing.md, backgroundColor: Palette.primary, borderRadius: 20, padding: Spacing.lg, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  summaryLabel:      { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  summaryAmount:     { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
  payAllBtn:         { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  payAllBtnText:     { color: Palette.primary, fontWeight: '800', fontSize: 15 },

  tabRow:            { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', maxWidth: 480, alignSelf: 'center', width: '100%' },
  tabBtn:            { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:      { borderBottomColor: Palette.primary },
  tabText:           { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive:     { color: Palette.primary, fontWeight: '700' },

  section:           { padding: Spacing.md, gap: Spacing.sm, maxWidth: 480, alignSelf: 'center', width: '100%' },
  sectionTitle:      { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: Spacing.sm, marginBottom: Spacing.xs },

  pendingCard:       { backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: '#F59E0B', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  pendingTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pendingCourt:      { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  pendingAmount:     { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  pendingMeta:       { fontSize: 13, color: '#64748B' },
  pendingId:         { fontSize: 10, color: '#64748B', marginTop: 4 },

  methodRow:         { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff', marginBottom: Spacing.sm },
  methodRowActive:   { borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  methodLogo:        { width: 28, height: 28, marginRight: Spacing.md },
  methodLabel:       { flex: 1, fontSize: 14, color: '#0F172A' },
  radio:             { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  radioDot:          { width: 10, height: 10, borderRadius: 5 },

  payBtn:            { backgroundColor: Palette.primary, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  payBtnText:        { color: '#fff', fontSize: 18, fontWeight: '800' },
  secureFooter:      { textAlign: 'center', fontSize: 12, color: '#64748B', marginTop: Spacing.sm },

  empty:             { alignItems: 'center', paddingTop: 40, paddingBottom: Spacing.lg },
  emptyTitle:        { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  emptySub:          { fontSize: 14, color: '#64748B', marginTop: 6 },

  historyCard:       { backgroundColor: '#fff', borderRadius: 14, padding: Spacing.md, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  historyTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyCourt:      { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  historyAmount:     { fontSize: 16, fontWeight: '800', color: '#10B981' },
  historyMeta:       { fontSize: 12, color: '#64748B', marginBottom: 6 },
  historyFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyId:         { fontSize: 10, color: '#64748B' },
  historyBadge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  historyBadgePaid:  { backgroundColor: '#E8F8EF' },
  historyBadgeRefund:{ backgroundColor: '#FFF8E1' },
  historyBadgeText:  { fontSize: 11, fontWeight: '700' },
});
