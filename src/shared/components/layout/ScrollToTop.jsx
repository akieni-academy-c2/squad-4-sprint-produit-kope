import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remet la vue en haut à chaque changement de page.
 *
 * Une application monopage conserve la position d'une route à l'autre. Sur les
 * tableaux de bord, chaque section a son adresse : descendre au bas de « Mes
 * avis » puis passer à « Mes contacts » atterrissait au milieu de la nouvelle
 * section, avant son titre.
 *
 * `pathname` seul, pas la recherche : un changement de query string est un
 * changement *à l'intérieur* de la même page - un filtre, une pagination - et
 * la position doit y être conservée, sinon revenir en arrière après avoir
 * changé un filtre jetterait en haut alors qu'on cherche ce qu'on vient de
 * quitter.
 *
 * `behavior: 'instant'` : `scrollTop = 0` se fait rattraper par un éventuel
 * `scroll-behavior: smooth` et étire le retour sur une seconde.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
