import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * `loader` doit être stable : `useCallback` ou fonction de module.
 */
export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  // Un `useRef` plutôt qu'un `useState` : l'identifiant de requête n'est jamais
  // lu au rendu, et un état déclencherait un rendu de plus à chaque appel.
  const requestId = useRef(0);
  const controller = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    // Invalide toute requête précédente et prend la main.
    controller.current?.abort();
    const localController = new AbortController();
    controller.current = localController;
    const id = ++requestId.current;

    const isStale = () => id !== requestId.current;

    // `silent` : garde les données affichées pendant la requête. Utilisé après
    // une écriture, où remplacer la page par un squelette ferait clignoter tout
    // l'écran au moment où l'utilisateur attend le résultat de son action.
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current({ signal: localController.signal });
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

  // Mise à jour locale après une écriture réussie. Un `reload()` ferait
// clignoter toute la page pour un simple interrupteur ; ne rien faire laisse
// l'affichage faux jusqu'au prochain rechargement.
const mutate = useCallback((update) => {
  setData((prev) => (typeof update === 'function' ? update(prev) : update));
}, []);

useEffect(() => {
    // Cet effet existe pour déclencher le chargement : poser l'état y est sa
    // raison d'être, pas un effet de bord accidentel. La règle
    // `set-state-in-effect` vise le cas inverse - recalculer un état dérivé à
    // chaque rendu, ce qu'un `useMemo` ferait mieux. L'erreur est déjà captée
    // par l'état `error` : ce `catch` ne sert qu'à ne pas laisser une promesse
    // rejetée sans gestionnaire.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => {});
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load, mutate };
}
