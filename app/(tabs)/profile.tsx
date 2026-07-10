import { Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU = [
  { icon: '✏️', label: 'Edit Profile',     route: '/profile-edit'           },
  { icon: '📋', label: 'Booking History',  route: '/booking/history'        },
  { icon: '🔔', label: 'Notifications',    route: '/notification-settings'  },
  { icon: '⚙️', label: 'Settings',         route: '/settings'               },
  { icon: '❓', label: 'Help & Support',   route: '/help-support'           },
  { icon: '📄', label: 'Terms & Privacy',  route: '/terms-privacy'          },
];

export default function ProfileScreen() {
  const router      = useRouter();
  const { user, logout } = useAuth();
  const initials    = (user?.name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} accessibilityLabel="Change photo">
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Player'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>⭐ Intermediate</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>Rank #5</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/profile-edit')} accessibilityRole="button" accessibilityLabel="Edit profile">
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          {MENU.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx > 0 && styles.menuRowBorder]}
              onPress={() => item.route && router.push(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Sign out">
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  // Hero
  hero:           { alignItems: 'center', paddingBottom: Spacing.lg, backgroundColor: '#fff', marginBottom: Spacing.sm, overflow: 'hidden' },
  heroBg:         { position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: Palette.primary },
  avatarWrap:     { marginTop: Spacing.xl, position: 'relative' },
  avatar:         { width: 96, height: 96, borderRadius: 48, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarText:     { color: '#fff', fontSize: 30, fontWeight: '900' },
  editAvatarBtn:  { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  editAvatarIcon: { fontSize: 12 },
  userName:       { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: Spacing.sm },
  userEmail:      { fontSize: 13, color: '#64748B', marginTop: 2 },
  levelRow:       { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  levelBadge:     { backgroundColor: '#FFF8E1', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  levelText:      { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  rankBadge:      { backgroundColor: Palette.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  rankText:       { fontSize: 12, color: Palette.primary, fontWeight: '700' },
  editProfileBtn: { marginTop: Spacing.md, borderWidth: 1.5, borderColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 9, borderRadius: 100 },
  editProfileText:{ color: Palette.primary, fontWeight: '700', fontSize: 13 },

  // Menu
  menuCard:      { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: Spacing.md, overflow: 'hidden', marginBottom: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, height: 56 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  menuIcon:      { fontSize: 18, width: 28 },
  menuLabel:     { flex: 1, fontSize: 15, color: '#0F172A' },
  menuChevron:   { fontSize: 20, color: '#64748B' },

  // Logout
  logoutBtn:  { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
