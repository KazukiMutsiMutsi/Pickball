import { HapticTab } from '@/components/haptic-tab';
import { Palette } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Custom tab icon with optional badge
function TabIcon({
  emoji, label, focused, badge,
}: { emoji: string; label: string; focused: boolean; badge?: number }) {
  return (
    <View style={iconStyles.wrap}>
      <View style={[iconStyles.iconWrap, focused && iconStyles.iconWrapActive]}>
        <Text style={iconStyles.emoji}>{emoji}</Text>
        {!!badge && (
          <View style={iconStyles.badge}>
            <Text style={iconStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap:           { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap:       { alignItems: 'center', justifyContent: 'center', width: 40, height: 32, borderRadius: 16 },
  iconWrapActive: { backgroundColor: Palette.primaryLight },
  emoji:          { fontSize: 22 },
  badge:          { position: 'absolute', top: -2, right: -4, backgroundColor: Palette.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:      { color: '#fff', fontSize: 9, fontWeight: '800' },
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: 'Courts',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏓" label="Courts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" label="Matches" focused={focused} badge={2} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Community" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />

      {/* Hidden redirect tabs — keep out of tab bar */}
      <Tabs.Screen name="explore"        options={{ href: null }} />
      <Tabs.Screen name="bookings"       options={{ href: null }} />
      <Tabs.Screen name="notifications"  options={{ href: null }} />
    </Tabs>
  );
}
