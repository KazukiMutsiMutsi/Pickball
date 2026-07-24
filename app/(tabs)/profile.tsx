import { Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Load expo-image-picker dynamically on native only to avoid web bundling issues

const MENU = [
  { label: 'Edit Profile',     route: '/profile-edit'           },
  { label: 'Booking History',  route: '/booking/history'        },
  { label: 'Notifications',    route: '/notification-settings'  },
  { label: 'Settings',         route: '/settings'               },
  { label: 'Help & Support',   route: '/help-support'           },
  { label: 'Terms & Privacy',  route: '/terms-privacy'          },
];

export default function ProfileScreen() {
  const router      = useRouter();
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const initials    = (user?.name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const pickProfilePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not supported on web',
        'Please open this app on a mobile device to choose a profile photo.',
      );
      return;
    }

    const ImagePicker = await import('expo-image-picker');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to choose a profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const didCancel = 'canceled' in result ? result.canceled : (result as any).cancelled;
    if (didCancel) {
      return;
    }

    const uri = 'assets' in result ? result.assets?.[0]?.uri : (result as any).uri;
    if (uri) {
      setAvatarUri(uri);
    }
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
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              <TouchableOpacity
                style={styles.avatarAddBtn}
                onPress={pickProfilePhoto}
                accessibilityLabel="Add profile photo"
              >
                <Text style={styles.avatarAddText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.editAvatarBtn} 
              onPress={pickProfilePhoto}
              accessibilityLabel="Change photo"
            >
              <Text style={styles.editAvatarText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Player'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={styles.levelRow}>
        
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
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>Open</Text>
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
  avatar:         { width: 96, height: 96, borderRadius: 48, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', overflow: 'hidden' },
  avatarImage:    { width: 96, height: 96, resizeMode: 'cover' },
  avatarText:     { color: '#fff', fontSize: 30, fontWeight: '900' },
  editAvatarBtn:  { position: 'absolute', bottom: 0, right: 0, minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 6, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  editAvatarText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  avatarAddBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarAddText: { color: Palette.primary, fontSize: 18, fontWeight: '900', lineHeight: 18 },
  userName:       { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: Spacing.sm },
  userEmail:      { fontSize: 13, color: '#64748B', marginTop: 2 },
  levelRow:       { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  editProfileBtn: { marginTop: Spacing.md, borderWidth: 1.5, borderColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 9, borderRadius: 100 },
  editProfileText:{ color: Palette.primary, fontWeight: '700', fontSize: 13 },

  // Menu
  menuCard:      { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: Spacing.md, overflow: 'hidden', marginBottom: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, height: 56 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  menuLabel:     { flex: 1, fontSize: 15, color: '#0F172A' },
  menuChevron:   { fontSize: 20, color: '#64748B' },

  // Logout
  logoutBtn:  { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
