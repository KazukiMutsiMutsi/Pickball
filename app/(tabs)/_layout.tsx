import { HapticTab } from '@/components/haptic-tab';
import { Palette } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function UserTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.grey400,
        tabBarHideOnKeyboard: true,
        tabBarIcon: () => null,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#EBEBEB',
          height: Platform.OS === 'ios' ? 82 : 66,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 4,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home' }} />
      <Tabs.Screen name="courts"   options={{ title: 'Courts', tabBarLabel: 'Courts' }} />
      <Tabs.Screen name="bookings" options={{ title: 'My Bookings', tabBarLabel: 'My Bookings' }} />
      <Tabs.Screen name="payments" options={{ title: 'Payments', tabBarLabel: 'Payments' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />

      {/* Hidden tabs */}
      <Tabs.Screen name="explore"       options={{ href: null }} />
      <Tabs.Screen name="matches"       options={{ href: null }} />
      <Tabs.Screen name="community"     options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
