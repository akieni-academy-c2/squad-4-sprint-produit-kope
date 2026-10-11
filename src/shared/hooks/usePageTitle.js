import { useEffect } from 'react';

const SUFFIX = 'KOP';

/**
 * Titre de document par page.
 *
 * Sans cela, toutes les routes partagent le titre de index.html : Google
 * affiche « Annuaire des artisans » pour la page de contact comme pour une
 * fiche. Écrit dans le document plutôt qu'au rendu React, pour être lisible
 * par un crawler qui n'exécute pas JavaScript.
 */
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;
    document.title = title === SUFFIX ? SUFFIX : `${title} | ${SUFFIX}`;
  }, [title]);
}