import { Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#7C3AED';
const DARK   = '#1E1B2E';
const CARD   = '#2A2640';

// ─── Mock: already-checked-in bookings ───────────────────────────────────────
type CheckinStatus = 'valid' | 'already_used' | 'not_found' | 'expired';

interface ScanResult {
  status:    CheckinStatus;
  bookingId: string;
  user:      string;
  court:     string;
  date:      string;
  time:      string;
  checkedIn: string | null;
}

const MOCK_DB: Record<string, Omit<ScanResult, 'status'> & { used: boolean }> = {
  'BKG-A1B2C3': { bookingId: 'BKG-A1B2C3', user: 'Juan dela Cruz',  court: 'Court 1', date: '2026-07-12', time: '9:00 AM',  checkedIn: null, used: false },
  'BKG-D4E5F6': { bookingId: 'BKG-D4E5F6', user: 'Maria Santos',    court: 'Court 2', date: '2026-07-12', time: '2:00 PM',  checkedIn: null, used: false },
  'BKG-G7H8I9': { bookingId: 'BKG-G7H8I9', user: 'Pedro Reyes',     court: 'Court 3', date: '2026-07-11', time: '4:00 PM',  checkedIn: '3:58 PM', used: true  },
  'BKG-J1K2L3': { bookingId: 'BKG-J1K2L3', user: 'Ana Gonzales',    court: 'Court 1', date: '2026-07-10', time: '10:00 AM', checkedIn: null, used: false },
};

function lookupBooking(id: string): ScanResult {
  const rec = MOCK_DB[id.toUpperCase()];
  if (!rec) return { status: 'not_found', bookingId: id, user: '', court: '', date: '', time: '', checkedIn: null };
  if (rec.used) return { ...rec, status: 'already_used' };
  return { ...rec, status: 'valid' };
}

// ─── Recent scans log ─────────────────────────────────────────────────────────
interface ScanLog {
  id:     string;
  result: ScanResult;
  time:   string;
}

const STATUS_CONFIG: Record<CheckinStatus, { color: string; bg: string; icon: string; label: string }> = {
  valid:        { color: '#34D399', bg: '#34D39922', icon: '✅', label: 'Check-in OK'     },
  already_used: { color: '#FBBF24', bg: '#FBBF2422', icon: '⚠️', label: 'Already Used'   },
  not_found:    { color: '#F87171', bg: '#F8717122', icon: '❌', label: 'Booking Not Found'},
  expired:      { color: '#9CA3AF', bg: '#9CA3AF22', icon: '⏰', label: 'Expired'         },
};

export default function AdminScannerScreen() {
  const router = useRouter();
  const [manualId,  setManualId]  = useState('');
  const [lastResult,setLastResult]= useState<ScanResult | null>(null);
  const [scanLog,   setScanLog]   = useState<ScanLog[]>([]);
  const [scanning,  setScanning]  = useState(false);

  const processId = (id: string) => {
    const result = lookupBooking(id.trim());
    // Mark as used in mock DB
    if (result.status === 'valid' && MOCK_DB[id.toUpperCase()]) {
      MOCK_DB[id.toUpperCase()].used = true;
      MOCK_DB[id.toUpperCase()].checkedIn = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      result.checkedIn = MOCK_DB[id.toUpperCase()].checkedIn;
    }
    setLastResult(result);
    setScanLog((prev) => [{
      id:     `scan-${Date.now()}`,
      result,
      time:   new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }, ...prev.slice(0, 19)]);
    setManualId('');
  };

  const handleManualLookup = () => {
    if (!manualId.trim()) return;
    processId(manualId);
  };

  // Simulate camera scan on web (since expo-camera not installed)
  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const ids = Object.keys(MOCK_DB);
      const unused = ids.filter((id) => !MOCK_DB[id].used);
      const pick = unused.length > 0 ? unused[0] : ids[Math.floor(Math.random() * ids.length)];
      processId(pick);
      setScanning(false);
    }, 1500);
  };

  const statusConfig = lastResult ? STATUS_CONFIG[lastResult.status] : null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>QR Check-in Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Camera viewfinder ── */}
        <View style={s.viewfinderWrap}>
          <View style={s.viewfinder}>
            {scanning ? (
              <View style={s.scanningOverlay}>
                <View style={s.scanLine} />
                <Text style={s.scanningText}>Scanning…</Text>
              </View>
            ) : (
              <View style={s.idleOverlay}>
                {/* Corner brackets */}
                <View style={[s.corner, s.cornerTL]} />
                <View style={[s.corner, s.cornerTR]} />
                <View style={[s.corner, s.cornerBL]} />
                <View style={[s.corner, s.cornerBR]} />
                <Text style={s.idleIcon}>📷</Text>
                <Text style={s.idleText}>Point camera at QR code</Text>
              </View>
            )}
          </View>

          {/* Scan button */}
          <TouchableOpacity
            style={[s.scanBtn, scanning && s.scanBtnDisabled]}
            onPress={simulateScan}
            disabled={scanning}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code"
          >
            <Text style={s.scanBtnText}>{scanning ? 'Scanning…' : '📸 Scan QR Code'}</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <Text style={s.webNote}>* Camera preview simulated — install expo-camera for live scanning</Text>
          )}
        </View>

        {/* ── Manual entry ── */}
        <View style={s.manualSection}>
          <Text style={s.manualTitle}>Manual Entry</Text>
          <Text style={s.manualSub}>Type the booking ID if camera won't scan</Text>
          <View style={s.manualRow}>
            <TextInput
              style={s.manualInput}
              placeholder="e.g. BKG-A1B2C3"
              placeholderTextColor="#6B7280"
              value={manualId}
              onChangeText={setManualId}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleManualLookup}
              accessibilityLabel="Booking ID"
            />
            <TouchableOpacity style={s.manualBtn} onPress={handleManualLookup} accessibilityRole="button" accessibilityLabel="Look up booking">
              <Text style={s.manualBtnText}>Look Up</Text>
            </TouchableOpacity>
          </View>
          {/* Quick test IDs */}
          <View style={s.quickIds}>
            <Text style={s.quickIdsLabel}>Test IDs:</Text>
            {Object.keys(MOCK_DB).map((id) => (
              <TouchableOpacity key={id} style={s.quickIdChip} onPress={() => setManualId(id)}>
                <Text style={s.quickIdText}>{id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Result card ── */}
        {lastResult && statusConfig && (
          <View style={[s.resultCard, { borderLeftColor: statusConfig.color, borderLeftWidth: 4 }, shadowMd]}>
            <View style={s.resultHeader}>
              <Text style={s.resultIcon}>{statusConfig.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.resultStatus, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                <Text style={s.resultId}>{lastResult.bookingId}</Text>
              </View>
              <View style={[s.resultBadge, { backgroundColor: statusConfig.bg }]}>
                <Text style={[s.resultBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              </View>
            </View>

            {lastResult.status !== 'not_found' && (
              <>
                <View style={s.resultDivider} />
                <View style={s.resultDetails}>
                  <View style={s.resultRow}><Text style={s.resultLabel}>Player</Text><Text style={s.resultValue}>{lastResult.user}</Text></View>
                  <View style={s.resultRow}><Text style={s.resultLabel}>Court</Text><Text style={s.resultValue}>{lastResult.court}</Text></View>
                  <View style={s.resultRow}><Text style={s.resultLabel}>Date</Text><Text style={s.resultValue}>{lastResult.date}</Text></View>
                  <View style={s.resultRow}><Text style={s.resultLabel}>Time</Text><Text style={s.resultValue}>{lastResult.time}</Text></View>
                  {lastResult.checkedIn && (
                    <View style={s.resultRow}>
                      <Text style={s.resultLabel}>Checked in</Text>
                      <Text style={[s.resultValue, { color: '#34D399' }]}>{lastResult.checkedIn} ✓</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* ── Scan log ── */}
        {scanLog.length > 0 && (
          <View style={s.logSection}>
            <Text style={s.logTitle}>Recent Scans</Text>
            {scanLog.map((log) => {
              const cfg = STATUS_CONFIG[log.result.status];
              return (
                <View key={log.id} style={[s.logRow, shadowSm]}>
                  <Text style={s.logIcon}>{cfg.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.logId}>{log.result.bookingId}</Text>
                    <Text style={s.logUser}>{log.result.user || 'Unknown'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.logStatus, { color: cfg.color }]}>{cfg.label}</Text>
                    <Text style={s.logTime}>{log.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: DARK },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#3D3A55' },
  backBtn: { width: 40 },
  backIcon:{ fontSize: 30, color: PURPLE, lineHeight: 34 },
  title:   { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff' },

  // Viewfinder
  viewfinderWrap: { alignItems: 'center', padding: Spacing.lg, backgroundColor: '#16132A' },
  viewfinder:     { width: 260, height: 260, borderRadius: 16, backgroundColor: '#0D0B1A', overflow: 'hidden', marginBottom: Spacing.md },
  idleOverlay:    { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  corner:         { position: 'absolute', width: 28, height: 28, borderColor: PURPLE, borderWidth: 3 },
  cornerTL:       { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR:       { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL:       { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR:       { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0 },
  idleIcon:       { fontSize: 52, marginBottom: Spacing.sm },
  idleText:       { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  scanningOverlay:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanLine:       { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: PURPLE, opacity: 0.8 },
  scanningText:   { fontSize: 14, color: '#fff', fontWeight: '600' },
  scanBtn:        { backgroundColor: PURPLE, paddingHorizontal: Spacing.xl, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scanBtnDisabled:{ opacity: 0.5 },
  scanBtnText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  webNote:        { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: Spacing.sm },

  // Manual entry
  manualSection: { margin: Spacing.md, backgroundColor: CARD, borderRadius: 16, padding: Spacing.md },
  manualTitle:   { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  manualSub:     { fontSize: 12, color: '#9CA3AF', marginBottom: Spacing.md },
  manualRow:     { flexDirection: 'row', gap: Spacing.sm },
  manualInput:   { flex: 1, backgroundColor: '#1E1B2E', borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: '#3D3A55' },
  manualBtn:     { backgroundColor: PURPLE, paddingHorizontal: Spacing.md, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  manualBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  quickIds:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center' },
  quickIdsLabel: { fontSize: 11, color: '#9CA3AF' },
  quickIdChip:   { backgroundColor: '#1E1B2E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#3D3A55' },
  quickIdText:   { fontSize: 11, color: '#9CA3AF' },

  // Result card
  resultCard:    { marginHorizontal: Spacing.md, backgroundColor: CARD, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.md },
  resultHeader:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  resultIcon:    { fontSize: 28 },
  resultStatus:  { fontSize: 16, fontWeight: '800' },
  resultId:      { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  resultBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  resultBadgeText:{ fontSize: 11, fontWeight: '700' },
  resultDivider: { height: 1, backgroundColor: '#3D3A55', marginVertical: Spacing.sm },
  resultDetails: { gap: 6 },
  resultRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  resultLabel:   { fontSize: 12, color: '#9CA3AF' },
  resultValue:   { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Log
  logSection: { marginHorizontal: Spacing.md },
  logTitle:   { fontSize: 14, fontWeight: '700', color: '#E2E8F0', marginBottom: Spacing.sm },
  logRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  logIcon:    { fontSize: 20, width: 28 },
  logId:      { fontSize: 13, fontWeight: '700', color: '#fff' },
  logUser:    { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  logStatus:  { fontSize: 11, fontWeight: '700' },
  logTime:    { fontSize: 10, color: '#6B7280', marginTop: 2 },
});
