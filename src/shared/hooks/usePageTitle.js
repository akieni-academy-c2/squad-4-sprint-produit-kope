import { useEffect } from 'react';

const SUFFIX = 'KOP';

/**
 * Portée réelle : l'écriture passe par le document, elle n'est visible qu'après
 * rendu. Un crawler qui n'exécute pas JavaScript ne la voit pas.
 */
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;
    document.title = title === SUFFIX ? SUFFIX : `${title} | ${SUFFIX}`;
  }, [title]);
}