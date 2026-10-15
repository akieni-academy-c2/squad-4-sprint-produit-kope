import { useEffect, useState, useCallback, useRef } from "react";
import {
  listCities,
  listTrades,
  listZones,
  invalidateReferenceCache,
  peekReferenceData,
} from "../services/reference.service.js";

export function useReferenceData() {
  const cached = peekReferenceData();
  const hasCache = Boolean(cached.trades && cached.zones && cached.cities);

  const [trades, setTrades] = useState(cached.trades ?? []);
  const [zones, setZones] = useState(cached.zones ?? []);
  const [cities, setCities] = useState(cached.cities ?? []);
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, z, c] = await Promise.all([
        listTrades(),
        listZones(),
        listCities(),
      ]);
      if (!mounted.current) return;
      setTrades(t);
      setZones(z);
      setCities(c);
    } catch (err) {
      if (!mounted.current) return;
      setError(err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    invalidateReferenceCache();
    await load();
  }, [load]);

  useEffect(() => {
    mounted.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!hasCache) load();

    return () => {
      mounted.current = false;
    };
  }, [load, hasCache]);

  return { trades, zones, cities, loading, error, reload };
}
