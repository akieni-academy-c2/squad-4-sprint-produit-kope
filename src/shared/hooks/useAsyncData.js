import { useCallback, useEffect, useRef, useState } from "react";

/**
 * La liste de dépendances est fournie par l'appelant : c'est le contrat du
 * hook, pas une liste que le lint pourrait déduire. La conserver telle quelle
 * évite de recharger quand l'appelant passe un tableau littéral à chaque rendu.
 */
export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const requestId = useRef(0);
  const controller = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    controller.current?.abort();
    const localController = new AbortController();
    controller.current = localController;
    const id = ++requestId.current;

    const isStale = () => id !== requestId.current;

    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current({
        signal: localController.signal,
      });
      if (isStale()) return result;
      setData(result);
      return result;
    } catch (err) {
      if (isStale() || localController.signal.aborted) return undefined;
      setError(err);
      if (!silent) setData(undefined);
      throw err;
    } finally {
      if (!isStale() && !silent) setLoading(false);
    }
  }, []);

  const mutate = useCallback((update) => {
    setData((prev) => (typeof update === "function" ? update(prev) : update));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => {});
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load, mutate };
}
