import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#7C3AED';
const DARK   = '#1E1B2E';
const CARD   = '#2A2640';

function SettingRow({ label, value, onToggle, desc }: {
  label: string; value: boolean; onToggle: () => void; desc?: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {desc && <Text style={styles.settingDesc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3D3A55', true: PURPLE }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

function MenuRow({ icon, label, danger, onPress }: {
  icon: string; label: string; danger?: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: '#F87171' }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [bookingNotifs,  setBookingNotifs]  = useState(true);
  const [paymentAlerts,  setPaymentAlerts]  = useState(true);
  const [maintenanceMode,setMaintenanceMode]= useState(false);
  const [autoApprove,    setAutoApprove]    = useState(false);
  const [emailReports,   setEmailReports]   = useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Admin profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] ?? 'A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>{user?.name ?? 'Admin'}</Text>
            <Text style={styles.adminEmail}>{user?.email ?? ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>⚙️ Administrator</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} accessibilityLabel="Edit profile">
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.section}>
          <SettingRow label="New Booking Alerts"   value={bookingNotifs} onToggle={() => setBookingNotifs(v => !v)}   desc="Get notified on every new booking" />
          <View style={styles.rowDivider} />
          <SettingRow label="Payment Alerts"        value={paymentAlerts} onToggle={() => setPaymentAlerts(v => !v)}   desc="Notify on payment success or failure" />
          <View style={styles.rowDivider} />
          <SettingRow label="Weekly Email Reports"  value={emailReports}  onToggle={() => setEmailReports(v => !v)}    desc="Summary reports every Monday" />
        </View>

        {/* System */}
        <Text style={styles.sectionTitle}>SYSTEM</Text>
        <View style={styles.section}>
          <SettingRow
            label="Maintenance Mode"
            value={maintenanceMode}
            onToggle={() => setMaintenanceMode(v => !v)}
            desc="Disable bookings for all users"
          />
          <View style={styles.rowDivider} />
          <SettingRow
            label="Auto-Approve Bookings"
            value={autoApprove}
            onToggle={() => setAutoApprove(v => !v)}
            desc="Skip manual review for new bookings"
          />
        </View>

        {/* Management */}
        <Text style={styles.sectionTitle}>MANAGEMENT</Text>
        <View style={styles.section}>
          <MenuRow icon="💳" label="Payment Settings"   onPress={() => {}} />
          <View style={styles.rowDivider} />
          <MenuRow icon="🕐" label="Operating Hours"    onPress={() => {}} />
          <View style={styles.rowDivider} />
          <MenuRow icon="💬" label="Terms & Policies"   onPress={() => {}} />
          <View style={styles.rowDivider} />
          <MenuRow icon="📊" label="Export Data (CSV)"  onPress={() => {}} />
          <View style={styles.rowDivider} />
          <MenuRow icon="🔐" label="Change Password"    onPress={() => {}} />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <View style={styles.section}>
          <MenuRow icon="🗑️" label="Clear All Bookings"   danger onPress={() => {}} />
          <View style={styles.rowDivider} />
          <MenuRow icon="🔄" label="Reset App Data"       danger onPress={() => {}} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Logout">
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PicklePro Admin v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: DARK },
  body:         { padding: Spacing.md, paddingBottom: 40 },
  profileCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  avatar:       { width: 56, height: 56, borderRadius: 28, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 24, fontWeight: '800' },
  adminName:    { fontSize: 16, fontWeight: '800', color: '#fff' },
  adminEmail:   { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  roleBadge:    { marginTop: 4, alignSelf: 'flex-start', backgroundColor: PURPLE + '33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  roleText:     { fontSize: 11, color: PURPLE, fontWeight: '700' },
  editBtn:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: PURPLE },
  editBtnText:  { color: PURPLE, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 0.8 },
  section:      { backgroundColor: CARD, borderRadius: Radius.md, overflow: 'hidden' },
  settingRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  settingLabel: { fontSize: 14, color: '#E2E8F0', fontWeight: '500' },
  settingDesc:  { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rowDivider:   { height: 1, backgroundColor: '#3D3A55', marginHorizontal: Spacing.md },
  menuRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 15 },
  menuIcon:     { fontSize: 18, marginRight: Spacing.md, width: 26 },
  menuLabel:    { flex: 1, fontSize: 14, color: '#E2E8F0' },
  chevron:      { fontSize: 20, color: '#6B7280' },
  logoutBtn:    { marginTop: Spacing.lg, backgroundColor: '#F87171' + '22', borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#F87171' + '55' },
  logoutText:   { color: '#F87171', fontSize: 15, fontWeight: '700' },
  version:      { textAlign: 'center', fontSize: 11, color: '#3D3A55', marginTop: Spacing.md },
});
