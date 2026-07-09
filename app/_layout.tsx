import { AuthProvider } from '@/src/context/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash */}
        <Stack.Screen name="index" />

        {/* Auth */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />

        {/* User dashboard (tab bar) */}
        <Stack.Screen name="(tabs)" />

        {/* Admin dashboard (tab bar) */}
        <Stack.Screen name="(admin)" />

        {/* Booking flow */}
        <Stack.Screen name="courts/index" />
        <Stack.Screen name="courts/[id]" />
        <Stack.Screen name="booking/date" />
        <Stack.Screen name="booking/time" />
        <Stack.Screen name="booking/summary" />
        <Stack.Screen name="booking/payment" />
        <Stack.Screen name="booking/confirmation" />
        <Stack.Screen name="booking/history" />

        {/* Standalone */}
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
