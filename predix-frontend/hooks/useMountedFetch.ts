'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseMountedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

export function useMountedFetch<T>(
  fetcher: () => Promise<T>,
  initial: T | null = null,
): UseMountedFetchResult<T> {
  const [data, setData] = useState<T | null>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setError('');
        }
      } catch {
        if (!cancelled) setError('No pudimos cargar los datos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fetcher, tick]);

  return { data, loading, error, reload };
}
