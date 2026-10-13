import { useMemo } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';

/**
 * Liste paginée d'administration.
 *
 * Ce hook n'est plus une implémentation : c'est un adaptateur mince au-dessus de
 * `useAsyncData`, qui apporte la garde de course et l'annulation au démontage.
 * La version précédente était une deuxième recopie du même effet, et avait
 * donc les mêmes deux défauts - une réponse lente arrivant après une plus
 * récente écrasait la liste, et rien n'était annulé au démontage.
 *
 * ## Pourquoi `[fetchList]` comme dépendance
 *
 * `fetchList` est un `useCallback` dont le tableau de dépendances contient déjà
 * la page et les filtres appliqués. Son identité change donc exactement quand la
 * liste doit être rechargée. Le repasser ici évite d'écrire ce tableau une
 * seconde fois au site d'appel, où il finirait par diverger.
 *
 * Seule différence conservée : `data` vaut `null` plutôt que `undefined` avant
 * le premier chargement, ce que les tableaux admin testent.
 *
 * @param {() => Promise<any>} fetchList  `useCallback` sur la page et les filtres
 */
export function useAdminList(fetchList) {
  const { data, loading, error, reload, mutate } = useAsyncData(fetchList, [fetchList]);

  return useMemo(
    () => ({ data: data ?? null, loading, error, reload, mutate }),
    [data, loading, error, reload, mutate],
  );
}