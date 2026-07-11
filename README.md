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

# Start dev server (web — staff portal accessible at /staff)
npx expo start --web

# Start dev server (all platforms)
npx expo start
```

> **Note:** Run commands from inside the `Pickball` folder, not the parent directory.

---

## Screens

### Customer (Mobile + Web)
- Splash → Login / Register → Home → Courts (map) → Court Detail → Book Date → Book Time → Summary → Payment → Confirmation → History

### Staff Portal (Web only — `/staff`)
- Login → Dashboard → Schedule → Court Status → Response → Players

### Admin
- Dashboard → Bookings → Courts → Users → Settings

---

## Staff Portal

Accessible at `http://localhost:8081/staff` (web only).
On native (iOS/Android), the route redirects to the customer login screen.

**Demo credentials:**
- Email: `staff@picklepro.com`
- Password: `staff123`

### Pages

| Page | Description |
|---|---|
| Dashboard | Live KPI cards, upcoming bookings table, court overview, hero banner |
| Schedule | Month / Day / List views with booking management |
| Court Status | Toggle courts open/closed with close reason |
| Response | Today's check-in workflow — Approve, On Court, Complete, Reschedule |
| Players | 3-column view grouped by court with full booking details |

### Booking Status Flow

```
Customer books → pending
       ↓
Staff approves → confirmed
       ↓
Player arrives → checked_in (On Court)
       ↓
Session ends   → completed

Alternate paths:
confirmed → no_show              (player didn't arrive)
confirmed/pending → cancelled    (staff declined)
any → reschedule_requested       (customer asked to change time/court)
```

### Courts
- 3 courts: Court 1, Court 2, Court 3
- All Indoor, located at Pajo, Lapu-Lapu City
- Operating hours: **9:00 AM – 12:00 AM (midnight)**
- Bookings are whole hours only (no 30-minute slots)

### Booking Rules
- Advance booking: up to **30 days** from today
- Same-day bookings require at least **1 hour** lead time
- Conflict detection: unavailable slots are greyed out on the time picker
- Race condition guard: conflict is re-checked at payment before confirming

---

## Booking Conflict Logic

Three layers of protection against double-booking:

1. **UI layer** — slots that overlap existing bookings are shown as greyed out (✕) on the time picker, updated live as duration changes
2. **Same-day filter** — hides start times within 1 hour of now for today's bookings
3. **Payment guard** — re-checks for conflicts right before payment is processed; if the slot was taken while the user filled in payment details, an error is shown and the booking is blocked

Overlap rule: `newStart < existingEnd AND newEnd > existingStart`

---

## Tech Stack
- **Framework:** Expo SDK 54 + Expo Router 6
- **Language:** TypeScript
- **UI:** React Native (mobile) + plain React with inline styles (staff web portal)
- **Maps:** OpenStreetMap (Leaflet.js) on web, Google Maps deep-link on native
- **Payments UI:** GCash / Maya / Credit Card / PayPal (mock — needs PayMongo integration)
- **State:** In-memory mock store (`src/booking/bookingStore.ts`) — shared between customer and staff

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

## Recent Changes

### Staff Portal — July 2026

- **Schedule Day view** redesigned from horizontal timeline to 3-column layout (one column per court) showing booking cards sorted by time
- **Players tab** redesigned to match the same 3-column layout with full booking detail cards (companions, amount, duration, payment status, date, time slot, booking ID)
- **Pending status** restored — staff must approve bookings before they become confirmed
- **Operating hours** enforced: 9:00 AM – 12:00 AM, whole hours only, no 30-minute slots
- **Booking conflict detection** implemented across 3 layers (UI greyout, same-day filter, payment guard)
- **Advance booking limit** set to 30 days from today
- **Dashboard banner** updated to `#0D1F35` background with left/right photo panels (qwerty.jpg + imageg1.webp) fading into the center
- **Logo** updated to `lapickle.png` served from `public/` folder
- **"Checked In" renamed** to "On Court" across all staff screens
- **Live clock** added to the staff topbar (updates every second)
- **Date added** to each booking card in the Response tab
- **Court types** standardised to Indoor only (3 courts)
- **Total courts** reduced from 5 to 3
