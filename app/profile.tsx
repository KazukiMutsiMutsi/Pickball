import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  { icon: '📋', label: 'My Bookings', route: '/booking/history' },
  { icon: '🔔', label: 'Notifications', route: '/notifications' },
  { icon: '⚙️', label: 'Settings', route: '/settings' },
  { icon: '❓', label: 'Help & Support', route: null },
  { icon: '📄', label: 'Terms & Privacy', route: null },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
          <TouchableOpacity style={styles.editBtn} accessibilityRole="button" accessibilityLabel="Edit profile">
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '12', label: 'Bookings' },
            { value: '5', label: 'Courts' },
            { value: '4.9', label: 'Rating' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, idx > 0 && styles.menuItemBorder]}
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

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.grey100 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn: { width: 40 },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  profileSection: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: Palette.grey900 },
  email: { fontSize: 14, color: Palette.grey600, marginTop: 4 },
  editBtn: { marginTop: Spacing.md, borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.full, paddingHorizontal: 24, paddingVertical: 8 },
  editBtnText: { color: Palette.primary, fontSize: 14, fontWeight: '600' },

  statsRow: { flexDirection: 'row', margin: Spacing.md, gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', ...shadowSm },
  statValue: { fontSize: 24, fontWeight: '900', color: Palette.primary },
  statLabel: { fontSize: 11, color: Palette.grey600, marginTop: 2 },

  menu: { backgroundColor: '#fff', marginHorizontal: Spacing.md, borderRadius: Radius.md, overflow: 'hidden', ...shadowSm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 15 },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: Palette.grey200 },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: 15, color: Palette.grey900 },
  menuChevron: { fontSize: 20, color: Palette.grey400 },

  signOutBtn: { margin: Spacing.md, borderWidth: 1, borderColor: Palette.danger, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  signOutText: { color: Palette.danger, fontSize: 15, fontWeight: '700' },
});
