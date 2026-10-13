import { useCallback, useSyncExternalStore } from 'react';

/**
 * Suit une media query.
 *
 * ## Pourquoi un hook plutôt qu'un `if` dans le JSX
 *
 * La modale est une feuille sur mobile et une boîte centrée sur desktop. Les
 * deux ne peuvent pas partager le même mouvement : une boîte centrée qui
 * glisse depuis le bas semble tomber, une feuille qui se met à l'échelle
 * semble rétrécir sur elle-même. Il faut donc savoir **où on est** avant de
 * choisir la variante.
 *
 * ## Pourquoi `useSyncExternalStore`
 *
 * `matchMedia` est un magasin externe : l'état est dans le navigateur, pas
 * dans React. Le hook qui sait dialoguer avec un magasin externe est
 * `useSyncExternalStore`, et il est écrit pour ça. La version à l'Effet -
 * `useState` + `addEventListener` - se trompe dans les deux sens : elle écrit
 * l'état dans le corps de l'effet au premier rendu, et elle peut rendre une
 * valeur périmée entre le moment où React la lit et celui où l'événement
 * arrive.
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
   * Rendu serveur : il n'y a pas de fenêtre. On renvoie `false`, ce qui fait
   * choisir la variante mobile - celle dont la mise en page est juste sans
   * JavaScript, puisqu'elle repose sur des classes et non sur l'état.
   */
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** `true` à partir du breakpoint `sm` de Tailwind - le palier de la modale. */
export const useIsDesktop = () => useMediaQuery('(min-width: 640px)');
