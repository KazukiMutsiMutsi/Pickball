/**
 * Staff web portal entry point.
 *
 * Accessible at:  http://localhost:8081/staff  (web only)
 * On native:      redirects to the app's login screen (staff have no mobile access)
 *
 * Run with:  npx expo start --web
 */

import StaffApp from './StaffApp';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function StaffEntry() {
  // On native (iOS / Android), staff portal is not available
  if (Platform.OS !== 'web') {
    return <Redirect href="/(auth)/login" />;
  }

  return <StaffApp />;
}
