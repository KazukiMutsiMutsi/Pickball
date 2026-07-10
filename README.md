# PicklePro 🏓

**Book pickleball courts in Lapu-Lapu City, Cebu.**

## App Info
- **App Name:** PicklePro
- **Bundle ID (iOS):** `com.picklepro.app`
- **Package (Android):** `com.picklepro.app`
- **Version:** 1.0.0

---

## Run locally

```bash
# Install dependencies
npm install

# Start dev server (web)
npx expo start --web

# Start dev server (all platforms)
npx expo start
```

---

## To make it official — step by step

### 1. Create an Expo / EAS account
1. Go to https://expo.dev/signup and create a free account
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Link project: `eas init` (run inside this folder)
5. Copy the `projectId` into `app.json` → `extra.eas.projectId`

### 2. Build for Android (APK / AAB)
```bash
# Preview APK (for testing, no Play Store needed)
eas build --platform android --profile preview

# Production AAB (for Google Play)
eas build --platform android --profile production
```

### 3. Build for iOS (IPA)
Requires a paid Apple Developer account ($99/year):
```bash
eas build --platform ios --profile production
```

### 4. Submit to Google Play Store
1. Create a Google Play developer account ($25 one-time fee)
2. Create the app listing at https://play.google.com/console
3. Download a service account key → save as `google-service-account.json`
4. Run: `eas submit --platform android`

### 5. Submit to Apple App Store
1. Enroll in Apple Developer Program at https://developer.apple.com
2. Create the app in App Store Connect
3. Update `eas.json` with your Apple credentials
4. Run: `eas submit --platform ios`

### 6. Set up real backend (replace mocks)
The app currently uses mock data. To go live:

| Feature | Recommended Service |
|---|---|
| Auth | Supabase Auth / Firebase Auth |
| Database | Supabase PostgreSQL / Firebase Firestore |
| Payments | PayMongo (PH) / Stripe |
| Push Notifications | Expo Push / Firebase FCM |
| Storage | Supabase Storage / Firebase Storage |

Update `src/services/auth.service.ts`, `src/services/courts.service.ts` etc. with real API calls.
Update `src/api/client.ts` → set `EXPO_PUBLIC_API_URL` in `.env`.

### 7. Set environment variables
Create `.env` in the project root:
```
EXPO_PUBLIC_API_URL=https://your-backend.com/api
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

---

## Tech Stack
- **Framework:** Expo SDK 54 + Expo Router 6
- **Language:** TypeScript
- **UI:** React Native (no Tailwind — pure StyleSheet)
- **Maps:** OpenStreetMap (Leaflet.js) on web, Google Maps deep-link on native
- **Payments UI:** GCash / Maya / Credit Card / PayPal (mock — needs PayMongo integration)

---

## Screens
### User
- Splash → Login / Register → Home (booking calendar) → Courts (map) → Court Details → Book → Pay → Confirm → History

### Admin
- Dashboard → Bookings → Courts → Users → Settings
