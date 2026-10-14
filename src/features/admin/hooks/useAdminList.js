import { useMemo } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';

export function useAdminList(fetchList) {
  const { data, loading, error, reload, mutate } = useAsyncData(fetchList, [fetchList]);

  return useMemo(
    () => ({ data: data ?? null, loading, error, reload, mutate }),
    [data, loading, error, reload, mutate],
  );
}