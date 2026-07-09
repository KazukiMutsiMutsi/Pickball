// Redirects to the full booking history screen
import { Redirect } from 'expo-router';
export default function BookingsTab() {
  return <Redirect href="/booking/history" />;
}
