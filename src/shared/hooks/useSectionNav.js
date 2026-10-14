import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sectionFromPathname, sectionHref } from '@/shared/lib/constants';

/**
 * Un onglet est une section du même écran : le rechargement, le bouton « retour »
 * et un lien de partage doivent tous la retrouver.
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