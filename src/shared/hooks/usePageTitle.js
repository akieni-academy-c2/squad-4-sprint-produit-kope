import { useEffect } from 'react';

const SUFFIX = 'KOP';

/**
 * Titre de document par page.
 *
 * Sans cela, toutes les routes partagent le titre de index.html : Google
 * affiche « Annuaire des artisans » pour la page de contact comme pour une
 * fiche.
 *
 * Portée réelle : cette écriture passe par le document, donc elle est visible
 * une fois la page rendue. Un crawler qui n'exécute pas JavaScript ne la voit
 * pas ; pour ces pages, le titre doit aussi figurer dans index.html.
 */
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;
    document.title = title === SUFFIX ? SUFFIX : `${title} | ${SUFFIX}`;
  }, [title]);
}