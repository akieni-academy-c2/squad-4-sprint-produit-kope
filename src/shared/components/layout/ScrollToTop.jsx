import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remet la vue en haut à chaque changement de page.
 *
 * ## Ce que fait le routeur, et ce qu'il ne fait pas
 *
 * Une application monopage **conserve la position de défilement** d'une route à
 * l'autre. C'est le comportement par défaut de `react-router`, et il est
 * discuté : une navigation par onglet s'en sert, un changement de page non.
 *
 * ## Le cas concret qui a fait ce composant
 *
 * Sur les tableaux de bord, chaque section a sa propre adresse. En descendant
 * au bas de « Mes avis », puis en passant à « Mes contacts », on restait à la
 * même hauteur — au milieu de la nouvelle section, avant son titre. La page
 * n'avait pas défilé : elle avait sauté.
 *
 * ## Pourquoi pas `scroll={false}`
 *
 * Ce serait l'erreur inverse : la position disparaîtrait même entre deux
 * changements de paramètre d'une **même** page — un filtre, une pagination.
 * Revenir en arrière après avoir changé un filtre repositionnerait la vue en
 * haut alors qu'on cherche ce qu'on vient de quitter.
 *
 * ## Pourquoi suivre `pathname` et non la recherche
 *
 * Un changement de query string — un filtre, une page de résultats — est un
 * changement **à l'intérieur** de la même page. La position doit y être
 * conservée : c'est ce qui permet de relire les résultats qu'on vient de faire
 * défiler en changeant un critère.
 *
 * `behavior: 'instant'` et non `window.scrollTop = 0` : ce dernier passe par le
 * flux normal de défilement et se fait rattraper par un éventuel
 * `scroll-behavior: smooth`, qui étirerait le retour en haut sur une seconde.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
