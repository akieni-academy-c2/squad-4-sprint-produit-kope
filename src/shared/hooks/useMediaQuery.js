import { useCallback, useSyncExternalStore } from 'react';

/**
 * `useSyncExternalStore` : `matchMedia` est un magasin externe, et la version
 * à l'Effet écrit l'état dans le corps de l'effet.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  /**
   * `false` fait choisir la variante mobile, la seule dont la mise en page
   * repose sur des classes et non sur l'état.
   */
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** `true` à partir du breakpoint `sm` de Tailwind - le palier de la modale. */
export const useIsDesktop = () => useMediaQuery('(min-width: 640px)');
