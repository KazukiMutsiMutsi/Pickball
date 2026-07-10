/**
 * StaffApp — Staff Web Portal root component.
 *
 * This is a self-contained React web app that lives inside the Expo project.
 * It uses plain React (no React Native primitives) so it only renders on web.
 *
 * Entry:  app/(staff)/index.tsx  →  renders <StaffApp />
 * Auth:   staff@picklepro.com / staff123  (swap with real API)
 */

import { useState } from 'react';
import StaffLayout from './components/StaffLayout';
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext';
import StaffCheckIn from './screens/StaffCheckIn';
import StaffCourts from './screens/StaffCourts';
import StaffDashboard from './screens/StaffDashboard';
import StaffLogin from './screens/StaffLogin';
import StaffPlayers from './screens/StaffPlayers';
import StaffSchedule from './screens/StaffSchedule';
import type { StaffPage } from './types';

// ─── Inner app (auth-gated) ────────────────────────────────────────────────────
function StaffPortal() {
  const { isAuthenticated } = useStaffAuth();
  const [page, setPage] = useState<StaffPage>('dashboard');

  if (!isAuthenticated) return <StaffLogin />;

  return (
    <StaffLayout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <StaffDashboard />}
      {page === 'schedule'  && <StaffSchedule  />}
      {page === 'courts'    && <StaffCourts    />}
      {page === 'checkin'   && <StaffCheckIn   />}
      {page === 'players'   && <StaffPlayers   />}
    </StaffLayout>
  );
}

// ─── Root with provider ────────────────────────────────────────────────────────
export default function StaffApp() {
  return (
    <StaffAuthProvider>
      <StaffPortal />
    </StaffAuthProvider>
  );
}
