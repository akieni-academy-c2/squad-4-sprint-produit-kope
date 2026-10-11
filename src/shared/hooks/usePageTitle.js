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

/** Balises Open Graph et Twitter, mises à jour avec le titre. */
export function usePageMeta({ description, image, url } = {}) {
  useEffect(() => {
    const set = (selector, attr, value) => {
      if (!value) return;
      document.querySelector(selector)?.setAttribute(attr, value);
    };
    set('meta[property="og:title"]', 'content', document.title);
    set('meta[property="og:description"]', 'content', description);
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:image"]', 'content', image);
    set('meta[property="og:url"]', 'content', url);
  }, [description, image, url]);
}