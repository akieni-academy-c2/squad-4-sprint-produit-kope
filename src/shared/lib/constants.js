export const ROLES = {
  CLIENT: 'client',
  PRO: 'professional',
  ADMIN: 'admin',
};

export const CITIES = ['Brazzaville'];
export const DEFAULT_COUNTRY = 'Congo';
export const DEFAULT_CITY = 'Brazzaville';

export const PAGE_SIZE = 10;
export const MAX_PHOTOS = 10;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME = ['image/jpeg', 'image/png'];

export const RG04_CHECKLIST = [
  { code: 'displayName', label: 'Renseignez le nom affiché' },
  { code: 'trade', label: 'Choisissez un métier' },
  { code: 'zones', label: "Choisissez au moins une zone d'intervention" },
  { code: 'phone', label: 'Renseignez un numéro de téléphone' },
  { code: 'description', label: 'Ajoutez une description (30 caractères minimum)' },
  { code: 'photos', label: 'Ajoutez au moins une photo de réalisation' },
];

export const PROFILE_STATUS = {
  INCOMPLETE: 'incomplete',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
};

export const PROFILE_STATUS_LABELS = {
  [PROFILE_STATUS.INCOMPLETE]: 'Incomplet',
  [PROFILE_STATUS.PUBLISHED]: 'Publié',
  [PROFILE_STATUS.HIDDEN]: 'Masqué',
};

export const ROUTES = {
  HOME: '/',
  HOW_IT_WORKS: '/how-it-works',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER_CLIENT: '/register/client',
  REGISTER_PRO: '/register/professional',
  DASHBOARD_CLIENT: '/dashboard/client',
  DASHBOARD_PRO: '/dashboard/pro',
  ADMIN: '/admin',
  TERMS: '/conditions-utilisation',
  NOT_FOUND: '/404',
  PROFESSIONAL: (id) => `/professionals/${id}`,
};

/**
 * Section courante d'un tableau de bord, déduite du dernier segment : le chemin peut
 * être préfixé (`/admin`). `''` est la valeur de repli, la racine comme toute route
 * inconnue retombant sur l'accueil plutôt que sur un écran vide.
 */

/**
 * Jour de respiration sous le header : collé au bord de la barre, l'empilement
 * se lit comme raté. Déclaré une seule fois, la valeur avait divergi en eleven
 * recopiages.
 */
export const STICKY_TOP = 'lg:sticky lg:top-[calc(var(--header-height)+1rem)]';

/** Bas collant, même respiration que `STICKY_TOP` en haut. */
export const STICKY_BOTTOM = 'lg:bottom-4';

/**
 * Bornée en haut et en bas, la carte se met à défiler dans la bande au lieu de
 * sortir de l'écran : l'action reste atteignable des deux extrémités.
 */
export const STICKY_BAND = `${STICKY_TOP} ${STICKY_BOTTOM}`;

/**
 * C'est `self-start` qui compte : un élément de grille s'étire sur la hauteur
 * de sa ligne, sans quoi il n'a nulle part où se coller.
 */
export const STICKY_COLUMN = `${STICKY_TOP} lg:self-start`;

/**
 * Section d'un tableau de bord déduite du chemin. La racine (`/admin`) comme une route
 * inconnue rendent `''` : le repli sur l'onglet d'accueil est laissé à `useSectionNav`.
 */
export function sectionFromPathname(pathname, sections) {
  const segment = String(pathname || '').split('/').filter(Boolean).pop();
  return sections.includes(segment) ? segment : '';
}

/** Chemin d'une section d'un tableau de bord, la racine si l'onglet est celui d'accueil. */
export function sectionHref(base, id, rootId) {
  return id && id !== rootId ? `${base}/${id}` : base;
}
