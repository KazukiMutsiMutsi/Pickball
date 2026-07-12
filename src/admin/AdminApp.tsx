import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminBookings from './screens/AdminBookings';
import AdminCourts from './screens/AdminCourts';
import AdminDashboard from './screens/AdminDashboard';
import AdminLogin from './screens/AdminLogin';
import AdminReports from './screens/AdminReports';
import AdminSettings from './screens/AdminSettings';
import AdminStaff from './screens/AdminStaff';
import AdminUsers from './screens/AdminUsers';
import type { AdminPage } from './types';

function AdminPortal() {
  const { isAuthenticated } = useAdminAuth();
  const [page, setPage] = useState<AdminPage>('dashboard');

  if (!isAuthenticated) return <AdminLogin />;

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <AdminDashboard />}
      {page === 'bookings'  && <AdminBookings  />}
      {page === 'courts'    && <AdminCourts    />}
      {page === 'users'     && <AdminUsers     />}
      {page === 'staff'     && <AdminStaff     />}
      {page === 'reports'   && <AdminReports   />}
      {page === 'settings'  && <AdminSettings  />}
    </AdminLayout>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminPortal />
    </AdminAuthProvider>
  );
}
