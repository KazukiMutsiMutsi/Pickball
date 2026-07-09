import { Court } from '@/src/components/CourtCard';
import { courtsService } from '@/src/services/courts.service';
import { useEffect, useState } from 'react';

export function useCourts() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    courtsService
      .getAll()
      .then(setCourts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { courts, loading, error };
}
