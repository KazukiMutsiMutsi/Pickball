import { AvailabilityGrid, courtsService } from '@/src/services/courts.service';
import { useCallback, useEffect, useState } from 'react';

export function useAvailability(date: string) {
  const [data, setData]       = useState<AvailabilityGrid | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!date) return;
    setLoading(true);
    courtsService
      .getAvailabilityGrid(date)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(refresh, [refresh]);

  return { data, loading, error, refresh };
}
