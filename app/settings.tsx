import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
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

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifs,      setPushNotifs]      = useState(true);
  const [emailNotifs,     setEmailNotifs]     = useState(true);
  const [bookingReminders,setBookingReminders]= useState(true);
  const [promoEmails,     setPromoEmails]     = useState(false);
  const [darkMode,        setDarkMode]        = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={[styles.section, shadowSm]}>
          {[
            { label: 'Push Notifications',  value: pushNotifs,       setter: setPushNotifs       },
            { label: 'Email Notifications', value: emailNotifs,      setter: setEmailNotifs      },
            { label: 'Booking Reminders',   value: bookingReminders, setter: setBookingReminders },
            { label: 'Promotions & Offers', value: promoEmails,      setter: setPromoEmails      },
          ].map((item, idx) => (
            <View key={item.label} style={[styles.row, idx > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setter}
                trackColor={{ false: Palette.grey300, true: Palette.primary }}
                accessibilityLabel={item.label}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={[styles.section, shadowSm]}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Palette.grey300, true: Palette.primary }}
              accessibilityLabel="Dark mode"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.section, shadowSm]}>
          {['Change Password', 'Payment Methods', 'Linked Accounts', 'Delete Account'].map((item, idx) => (
            <TouchableOpacity
              key={item}
              style={[styles.row, idx > 0 && styles.rowBorder]}
              accessibilityRole="button"
              accessibilityLabel={item}
            >
              <Text style={[styles.rowLabel, item === 'Delete Account' && { color: Palette.danger }]}>
                {item}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>PicklePro v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Palette.grey100 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:      { width: 40 },
  backIcon:     { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:        { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  body:         { padding: Spacing.md, gap: Spacing.xs },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Palette.grey500, marginTop: Spacing.md, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  section:      { backgroundColor: '#fff', borderRadius: Radius.md, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  rowBorder:    { borderTopWidth: 1, borderTopColor: Palette.grey200 },
  rowLabel:     { flex: 1, fontSize: 15, color: Palette.grey900 },
  chevron:      { fontSize: 20, color: Palette.grey400 },
  version:      { textAlign: 'center', fontSize: 12, color: Palette.grey400, marginTop: Spacing.xl },
});
