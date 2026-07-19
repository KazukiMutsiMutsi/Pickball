import { Layout, Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

type NotifItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFS: NotifItem[] = [
  {
    id: '1',
    title: 'Thank you for choosing PicklePro',
    message: 'We are glad to have you here. Book a court and enjoy the game!',
    time: 'Just now',
    read: false,
  },
  {
    id: '2',
    title: 'Bookings are open',
    message: 'Find available courts and reserve your slot anytime.',
    time: '1h ago',
    read: false,
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router   = useRouter();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Player';

  const params = useLocalSearchParams<{
    recentCourtName?: string;
    recentTotal?: string;
    recentPlayers?: string;
  }>();

  const [dismissed, setDismissed] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>(INITIAL_NOTIFS);
  const showRecent = !!params.recentCourtName && !dismissed;
  const unread = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.pageWrap}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.notifBtn, showNotif && styles.notifBtnActive, shadowSm]}
                onPress={() => setShowNotif(v => !v)}
                accessibilityLabel="Notifications"
              >
                <Text style={styles.notifIcon}>🔔</Text>
                {unread > 0 && (
                  <View style={styles.notifDot}>
                    <Text style={styles.notifCount}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarWrap}
                onPress={() => router.push('/(tabs)/profile')}
                accessibilityLabel="Profile"
              >
                <View style={[styles.avatar, shadowSm]}>
                  <Text style={styles.avatarText}>
                    {(user?.name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.onlineDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── PicklePro Hero Banner ── */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBubble1} />
            <View style={styles.heroBubble2} />
            <View style={styles.heroBubble3} />
            <View style={styles.heroLogoWrap}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.heroLogo}
                contentFit="cover"
                accessibilityLabel="PicklePro logo"
              />
            </View>
            <Text style={styles.heroTitle}>PicklePro</Text>
            <Text style={styles.heroMotto}>"Every ball that bounces, money counts"</Text>
            <Text style={styles.heroSub}>Find available courts and book instantly</Text>
            <View style={styles.heroPill}>
              <View style={styles.heroPillDot} />
              <Text style={styles.heroPillText}>Courts Available Now</Text>
            </View>
          </View>

          {/* ── Recent booking banner ── */}
          {showRecent && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.recentCard}>
              <View style={styles.recentLeft}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>Court Booked!</Text>
                  <Text style={styles.recentCourt} numberOfLines={1}>{params.recentCourtName}</Text>
                  <Text style={styles.recentMeta}>
                    {params.recentPlayers} player{parseInt(params.recentPlayers ?? '1') !== 1 ? 's' : ''}
                    {'  ·  '}₱{parseFloat(params.recentTotal ?? '0').toFixed(2)} paid
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDismissed(true)} style={styles.recentClose} accessibilityLabel="Dismiss">
                <Text style={{ color: '#94A3B8', fontSize: 20, fontWeight: '700' }}>×</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── Book a Court button ── */}
          <TouchableOpacity
            style={styles.bookCourtBtn}
            onPress={() => router.push('/availability')}
            accessibilityRole="button"
            accessibilityLabel="Book a Court"
          >
            <View style={styles.bookCourtBtnOverlay} />
            <View style={styles.bookCourtBtnContent}>
              <View style={{ flex: 1, zIndex: 1 }}>
                <Text style={styles.bookCourtBtnTitle}>Book a Court</Text>
                <Text style={styles.bookCourtBtnSub}>The fun starts here</Text>
              </View>
              <View style={styles.bookCourtBtnArrow}>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ height: Spacing.xxl }} />
        </View>
      </ScrollView>

      {/* ── Facebook-style notification dropdown ── */}
      <Modal
        visible={showNotif}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotif(false)}
      >
        <View style={styles.dropdownRoot}>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setShowNotif(false)} />
          <View style={styles.dropdownPanel}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Notifications</Text>
              {unread > 0 && (
                <TouchableOpacity onPress={markAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {notifs.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifRow, !item.read && styles.notifRowUnread]}
                  onPress={() => markRead(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notifBody}>
                    <Text style={styles.notifRowTitle} numberOfLines={2}>
                      <Text style={styles.notifRowTitleBold}>{item.title}</Text>
                      {'  '}{item.message}
                    </Text>
                    <Text style={[styles.notifTime, !item.read && styles.notifTimeUnread]}>
                      {item.time}
                    </Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F8FAFC' },
  content:      { paddingBottom: Spacing.xl },
  pageWrap:     { alignSelf: 'center', width: '100%', maxWidth: Layout.maxWidth },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting:     { fontSize: 13, color: '#64748B' },
  userName:     { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 1 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  notifBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  notifBtnActive: { backgroundColor: Palette.primaryLight },
  notifIcon:    { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  notifDot:     { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  notifCount:   { color: '#fff', fontSize: 9, fontWeight: '800', lineHeight: 11 },

  avatarWrap:   { position: 'relative' },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },

  heroBanner:   { marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#0D1F35', borderRadius: 24, paddingVertical: 28, paddingHorizontal: Spacing.lg, alignItems: 'center', overflow: 'hidden' },
  heroBubble1:  { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(26,143,227,0.18)', top: -40, left: -40 },
  heroBubble2:  { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(26,143,227,0.12)', bottom: -30, right: -20 },
  heroBubble3:  { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,215,0,0.08)', top: 20, right: 30 },
  heroLogoWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 3, borderColor: '#FFD700', marginBottom: 12 },
  heroLogo:     { width: 72, height: 72 },
  heroTitle:    { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 1, marginBottom: 4 },
  heroMotto:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 6, textAlign: 'center' },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14, textAlign: 'center' },
  heroPill:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.18)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)' },
  heroPillDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  heroPillText: { fontSize: 11, color: '#10B981', fontWeight: '700' },

  recentCard:     { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: '#F0FDF4', borderRadius: 16, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#86EFAC', gap: Spacing.sm },
  recentLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  recentTitle:    { fontSize: 12, fontWeight: '700', color: '#15803D', marginBottom: 1 },
  recentCourt:    { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  recentMeta:     { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  recentClose:    { padding: 4 },

  bookCourtBtn:        { marginHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: 20, overflow: 'hidden', backgroundColor: Palette.primary, shadowColor: Palette.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  bookCourtBtnOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', backgroundColor: '#0D1F35', opacity: 0.5, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  bookCourtBtnContent: { flexDirection: 'row', alignItems: 'center', padding: 22, zIndex: 1 },
  bookCourtBtnTitle:   { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  bookCourtBtnSub:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontStyle: 'italic' },
  bookCourtBtnArrow:   { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },

  // Facebook-style dropdown
  dropdownRoot:     { flex: 1 },
  dropdownBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  dropdownPanel:    {
    position: 'absolute',
    top: 56,
    right: Spacing.md,
    width: Math.min(340, W - Spacing.md * 2),
    maxHeight: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  dropdownHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownTitle:    { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  markAllText:      { fontSize: 12, color: Palette.primary, fontWeight: '600' },
  dropdownList:     { maxHeight: 300 },
  notifRow:         { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  notifRowUnread:   { backgroundColor: '#EFF6FF' },
  notifBody:        { flex: 1 },
  notifRowTitle:    { fontSize: 13, color: '#334155', lineHeight: 18 },
  notifRowTitleBold:{ fontWeight: '800', color: '#0F172A' },
  notifTime:        { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
  notifTimeUnread:  { color: Palette.primary },
  unreadDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.primary, marginTop: 6 },

  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  actionBtn:    { width: (W - Spacing.md * 2 - Spacing.sm * 2) / 4, borderRadius: 12, paddingVertical: Spacing.md, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  actionIcon:   { fontSize: 22 },
  actionLabel:  { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
});
