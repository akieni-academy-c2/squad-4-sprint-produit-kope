import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sectionFromPathname, sectionHref } from '@/shared/lib/constants';

/**
 * Navigation par onglets portée par l'URL.
 *
 * Un onglet de tableau de bord est une section du même écran, pas une page :
 * le rechargement doit la retrouver, le bouton « retour » du navigateur doit
 * défaire une navigation entre onglets, et un lien de partage doit ouvrir la
 * bonne vue. Aucun de ces trois comportements n'est possible avec un `useState`
 * local.
 *
 * ## Isolée dans un hook pour une raison concrète
 *
 * Le compilateur React abandonne la mémoïsation d'un composant dès que
 * `useNavigate` y est appelé directement : il ne parvient plus à préserver le
 * `useCallback` du chargement de profil et désactive l'optimisation du fichier
 * entier. Passé par un hook, l'appel est opaque et le composant reste
 * analysable — les deux tableaux de bord partagent en outre exactement la même
 * logique.
 *
 * @param base   racine du tableau de bord, ex. `/dashboard/client`
 * @param sections identifiants d'onglets connus
 * @param rootId identifiant de l'onglet d'accueil, servi de repli
 */
export function useSectionNav(base, sections, rootId) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Segment inconnu = repli sur l'accueil, pas un écran vide : une URL
  // éditoriale cassée ne doit pas laisser la colonne centrale déserte.
  const active = sectionFromPathname(pathname, sections) || rootId;

  const goTo = useCallback(
    (id) => navigate(sectionHref(base, id, rootId)),
    [navigate, base, rootId],
  );

  return { active, goTo };
}