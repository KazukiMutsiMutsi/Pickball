/**
 * Admin portal entry point.
 * Accessible at: http://localhost:8081/admin (web only)
 */
import AdminApp from './AdminApp';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function AdminEntry() {
  if (Platform.OS !== 'web') return <Redirect href="/(auth)/login" />;
  return <AdminApp />;
}
