import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type SFSymbol = 'house.fill' | 'location.fill' | 'calendar' | 'creditcard.fill' | 'person.fill';

function TabIcon({ symbol, focused, badge }: { symbol: SFSymbol; focused: boolean; badge?: number }) {
  return (
    <View style={ic.wrap}>
      <View style={[ic.box, focused && ic.boxActive]}>
        <IconSymbol name={symbol} size={22} color={focused ? Palette.primary : Palette.grey400} />
        {!!badge && (
          <View style={ic.badge}>
            <Text style={ic.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const ic = StyleSheet.create({
  wrap:      { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  box:       { alignItems: 'center', justifyContent: 'center', width: 44, height: 32, borderRadius: 16 },
  boxActive: { backgroundColor: Palette.primaryLight },
  badge:     { position: 'absolute', top: -2, right: -4, backgroundColor: Palette.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});

export default function UserTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.grey400,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#EBEBEB',
          height: Platform.OS === 'ios' ? 82 : 66,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home',       tabBarIcon: ({ focused }) => <TabIcon symbol="house.fill"     focused={focused} /> }} />
      <Tabs.Screen name="courts"   options={{ title: 'Courts',     tabBarIcon: ({ focused }) => <TabIcon symbol="location.fill"  focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'My Bookings',tabBarIcon: ({ focused }) => <TabIcon symbol="calendar"       focused={focused} badge={1} /> }} />
      <Tabs.Screen name="payments" options={{ title: 'Payments',   tabBarIcon: ({ focused }) => <TabIcon symbol="creditcard.fill"focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',    tabBarIcon: ({ focused }) => <TabIcon symbol="person.fill"    focused={focused} /> }} />

      {/* Hidden tabs */}
      <Tabs.Screen name="explore"       options={{ href: null }} />
      <Tabs.Screen name="matches"       options={{ href: null }} />
      <Tabs.Screen name="community"     options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
