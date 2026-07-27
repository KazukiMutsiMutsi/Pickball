import { useAuthContext } from '@/src/context/AuthContext';
import { Booking, bookingsService } from '@/src/services/bookings.service';
import { useEffect, useState } from 'react';

export function useBookings() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const refresh = () => {
    if (!user?.token) return;
    setLoading(true);
    bookingsService
      .getAll(user.token)
      .then(setBookings)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [user?.token]);

  return { bookings, loading, error, refresh };
}
