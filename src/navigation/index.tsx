// Navigation configuration
// This project uses Expo Router (file-based routing).
// Define your route structure in the app/ directory.
// Use this file for shared navigation helpers, types, or constants.

export type RootStackParamList = {
  '/(tabs)': undefined;
  '/courts': undefined;
  '/courts/[id]': { id: string };
  '/booking': { courtId: string };
  '/payment': { bookingId: string };
  '/booking-history': undefined;
  '/notifications': undefined;
  '/profile': undefined;
  '/settings': undefined;
};
