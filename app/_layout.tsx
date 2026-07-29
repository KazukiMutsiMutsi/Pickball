import { AuthProvider, supabase, useAuthContext } from '@/src/context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

// Redirect to correct screen based on auth state
function AuthGate() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const segments  = useSegments();
  const router    = useRouter();

  // Listen for Supabase auth state changes (handles Google OAuth callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User just signed in via Google OAuth deep link
          router.replace('/(tabs)');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth  = segments[0] === '(auth)';
    const inIndex = (segments as string[]).length === 0 || (segments as string[])[0] === 'index';

    if (isAuthenticated && (inAuth || inIndex)) {
      // Admin users go to admin panel, regular users to tabs
      if (user?.role === 'admin') {
        router.replace('/(admin)' as any);
      } else {
        router.replace('/(tabs)');
      }
    } else if (!isAuthenticated && !inAuth && !inIndex) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1F35' }}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash */}
        <Stack.Screen name="index" />

        {/* Auth */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />

        {/* User dashboard (tab bar) */}
        <Stack.Screen name="(tabs)" />

        {/* Booking flow */}
        <Stack.Screen name="courts/index" />
        <Stack.Screen name="courts/[id]" />
        <Stack.Screen name="booking/time" />
        <Stack.Screen name="booking/advance" />
        <Stack.Screen name="booking/summary" />
        <Stack.Screen name="booking/payment" />
        <Stack.Screen name="booking/confirmation" />
        <Stack.Screen name="booking/subscription" />
        <Stack.Screen name="booking/history" />
        <Stack.Screen name="booking/qr-ticket" />

        {/* Standalone */}
        <Stack.Screen name="availability" />
        <Stack.Screen name="profile-edit" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="terms-privacy" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
