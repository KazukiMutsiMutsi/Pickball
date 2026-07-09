import { Booking } from '@/src/components/BookingCard';
import { bookingsService } from '@/src/services/bookings.service';
import { useEffect, useState } from 'react';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    bookingsService
      .getAll()
      .then(setBookings)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return { bookings, loading, error, refresh };
}
